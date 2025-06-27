// Client-side audit logger for tracking user actions from the frontend

export interface ClientAuditLog {
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
}

export class ClientAuditLogger {
  static async log(logData: ClientAuditLog): Promise<void> {
    try {
      const response = await fetch('/api/audit-logs/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.error('Failed to log client audit:', await response.text());
      }
    } catch (error) {
      console.error('Error logging client audit:', error);
    }
  }

  static async logPageView(pageName: string, metadata?: any): Promise<void> {
    await this.log({
      action: 'PAGE_VIEW',
      entityType: 'page',
      newData: { pageName },
      metadata,
    });
  }

  static async logFormSubmit(formName: string, formData: any, metadata?: any): Promise<void> {
    await this.log({
      action: 'FORM_SUBMIT',
      entityType: 'form',
      newData: { formName, formData },
      metadata,
    });
  }

  static async logExport(exportType: string, filters?: any, metadata?: any): Promise<void> {
    await this.log({
      action: 'EXPORT',
      entityType: 'export',
      newData: { exportType, filters },
      metadata,
    });
  }

  static async logSearch(searchType: string, query: string, results?: number, metadata?: any): Promise<void> {
    await this.log({
      action: 'SEARCH',
      entityType: 'search',
      newData: { searchType, query, resultsCount: results },
      metadata,
    });
  }

  static async logFilter(filterType: string, filters: any, metadata?: any): Promise<void> {
    await this.log({
      action: 'FILTER',
      entityType: 'filter',
      newData: { filterType, filters },
      metadata,
    });
  }

  static async logPrint(documentType: string, documentId?: string, metadata?: any): Promise<void> {
    await this.log({
      action: 'PRINT',
      entityType: 'document',
      entityId: documentId,
      newData: { documentType },
      metadata,
    });
  }

  static async logError(errorType: string, error: any, metadata?: any): Promise<void> {
    await this.log({
      action: 'ERROR',
      entityType: 'error',
      newData: { 
        errorType, 
        message: error.message || error,
        stack: error.stack,
      },
      metadata,
    });
  }
}