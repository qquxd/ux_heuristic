export interface UXIssue {
  observation: string;
  severity: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  label: string;
  heuristic: string;
  solution: string;
}

export interface ReportJson {
  ux_score: number;
  issues: UXIssue[];
}

export interface PageRoute {
  id: number;
  page_name: string;
  page_url: string;
  status: string;
  ux_score: string;
  annotated_snapshot_path?: string;
  report_json?: ReportJson | null;
}

export interface FindPagesResponse {
  status: string;
  available_routes: PageRoute[];
}

export interface AvailableRoutesResponse extends Array<PageRoute> {}