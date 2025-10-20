import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { ExportService } from '@/lib/services/export.service';

export function useExport() {
  const { user } = useApp();

  // Export all data to JSON
  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const exportService = new ExportService(supabase, user.id);
      const jsonData = await exportService.exportAllData();

      // Trigger download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mm-health-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    },
  });

  // Export to CSV
  const exportCSVMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const exportService = new ExportService(supabase, user.id);
      const csvData = await exportService.exportToCSV();

      // Trigger download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mm-health-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    },
  });

  // Import data from JSON
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Read file
      const text = await file.text();

      const exportService = new ExportService(supabase, user.id);
      const stats = await exportService.importData(text);

      return stats;
    },
  });

  // Clear all data
  const clearDataMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const exportService = new ExportService(supabase, user.id);
      await exportService.clearAllData();

      return { success: true };
    },
  });

  return {
    exportData: exportMutation.mutate,
    exportDataAsync: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,

    exportCSV: exportCSVMutation.mutate,
    exportCSVAsync: exportCSVMutation.mutateAsync,
    isExportingCSV: exportCSVMutation.isPending,
    exportCSVError: exportCSVMutation.error,

    importData: importMutation.mutate,
    importDataAsync: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importStats: importMutation.data,

    clearData: clearDataMutation.mutate,
    clearDataAsync: clearDataMutation.mutateAsync,
    isClearing: clearDataMutation.isPending,
    clearError: clearDataMutation.error,
  };
}
