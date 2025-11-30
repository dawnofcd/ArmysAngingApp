/**
 * Import Songs Component
 * Import nhiều bài hát từ file Excel
 */

'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';
import { showToast } from './Toast';
import type { SongFormData, Category } from '@/types';

interface ImportSongsProps {
  categories: Category[];
  onImportComplete: () => void;
  onClose: () => void;
}

interface ExcelRow {
  'Tiêu đề'?: string;
  'Tác giả'?: string;
  'Lời bài hát'?: string;
  'Link Video Karaoke'?: string;
  'Link Video Người hát'?: string;
  'Danh mục'?: string;
  'Năm'?: number | string;
  'Ý nghĩa'?: string;
}

export function ImportSongs({
  categories,
  onImportComplete,
  onClose,
}: ImportSongsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<SongFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];

    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf('.'))
      .toLowerCase();

    if (
      !validTypes.includes(selectedFile.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      showToast('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV', 'error');
      return;
    }

    setFile(selectedFile);
    setPreview([]);
    setErrors([]);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        showToast('File Excel không có dữ liệu', 'error');
        return;
      }

      const parsedSongs: SongFormData[] = [];
      const validationErrors: string[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2; // +2 because Excel starts at 1 and we have header

        // Required fields
        const title = row['Tiêu đề']?.toString().trim();
        const author = row['Tác giả']?.toString().trim();
        const lyrics = row['Lời bài hát']?.toString().trim();
        const categoryName = row['Danh mục']?.toString().trim();

        // Optional fields
        const videoLinkKaraoke = row['Link Video Karaoke']?.toString().trim() || '';
        const videoLinkPerformance =
          row['Link Video Người hát']?.toString().trim() || '';
        const yearStr = row['Năm']?.toString().trim();
        const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
        const meaning = row['Ý nghĩa']?.toString().trim() || '';

        // Validation
        if (!title) {
          validationErrors.push(`Dòng ${rowNum}: Thiếu "Tiêu đề"`);
          return;
        }
        if (!author) {
          validationErrors.push(`Dòng ${rowNum}: Thiếu "Tác giả"`);
          return;
        }
        if (!lyrics) {
          validationErrors.push(`Dòng ${rowNum}: Thiếu "Lời bài hát"`);
          return;
        }
        if (!categoryName) {
          validationErrors.push(`Dòng ${rowNum}: Thiếu "Danh mục"`);
          return;
        }

        // Find category by name
        const category = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
        );
        if (!category) {
          validationErrors.push(
            `Dòng ${rowNum}: Không tìm thấy danh mục "${categoryName}"`,
          );
          return;
        }

        // Validate year
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
          validationErrors.push(
            `Dòng ${rowNum}: Năm không hợp lệ (${yearStr})`,
          );
          return;
        }

        parsedSongs.push({
          title,
          author,
          lyrics,
          videoLinkKaraoke,
          videoLinkPerformance,
          categoryId: category.id,
          year,
          meaning,
        });
      });

      setPreview(parsedSongs);
      setErrors(validationErrors);

      if (validationErrors.length > 0) {
        showToast(
          `Có ${validationErrors.length} lỗi trong file. Vui lòng kiểm tra.`,
          'warning',
        );
      } else {
        showToast(
          `Đã đọc thành công ${parsedSongs.length} bài hát từ file`,
          'success',
        );
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      showToast('Có lỗi xảy ra khi đọc file Excel', 'error');
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      showToast('Không có dữ liệu để import', 'error');
      return;
    }

    if (errors.length > 0) {
      showToast('Vui lòng sửa các lỗi trước khi import', 'error');
      return;
    }

    setImporting(true);
    try {
      const { importSongsFromExcel } = await import('@/utils/firestore');
      const result = await importSongsFromExcel(preview);

      showToast(
        `Import thành công ${result.success} bài hát. ${result.failed > 0 ? `${result.failed} bài hát thất bại.` : ''}`,
        result.failed > 0 ? 'warning' : 'success',
      );

      setFile(null);
      setPreview([]);
      setErrors([]);
      onImportComplete();
      onClose();
    } catch (error: any) {
      console.error('Error importing songs:', error);
      showToast('Có lỗi xảy ra khi import bài hát', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-military-green">
            Import bài hát từ Excel
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Hướng dẫn:
          </h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>
              • File Excel phải có các cột: <strong>Tiêu đề</strong>,{' '}
              <strong>Tác giả</strong>, <strong>Lời bài hát</strong>,{' '}
              <strong>Danh mục</strong>
            </li>
            <li>
              • Các cột tùy chọn: <strong>Link Video Karaoke</strong>,{' '}
              <strong>Link Video Người hát</strong>, <strong>Năm</strong>,{' '}
              <strong>Ý nghĩa</strong>
            </li>
            <li>• Dòng đầu tiên là tiêu đề cột</li>
            <li>
              • Danh mục phải khớp với tên danh mục đã có trong hệ thống
            </li>
          </ul>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Chọn file Excel (.xlsx, .xls, .csv)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading || importing}
              />
              <div className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-military-green transition-colors">
                <Upload className="w-5 h-5" />
                <span className="text-sm">
                  {file ? file.name : 'Click để chọn file'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg max-h-40 overflow-y-auto">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              Lỗi ({errors.length}):
            </h3>
            <ul className="text-sm space-y-1 text-red-700 dark:text-red-300">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Xem trước ({preview.length} bài hát):
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Tiêu đề</th>
                    <th className="p-2 text-left">Tác giả</th>
                    <th className="p-2 text-left">Danh mục</th>
                    <th className="p-2 text-left">Năm</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((song, index) => {
                    const category = categories.find(
                      (c) => c.id === song.categoryId,
                    );
                    return (
                      <tr
                        key={index}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="p-2">{song.title}</td>
                        <td className="p-2">{song.author}</td>
                        <td className="p-2">{category?.name || song.categoryId}</td>
                        <td className="p-2">{song.year}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={preview.length === 0 || errors.length > 0 || importing}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Đang import...' : `Import ${preview.length} bài hát`}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

