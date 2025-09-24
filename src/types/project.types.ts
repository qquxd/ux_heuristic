export interface PageRoute {
  id: number;
  page_name: string;
  page_url: string;
}

export interface FindPagesResponse {
  status: string;
  available_routes: PageRoute[];
}

export interface AvailableRoutesResponse extends Array<PageRoute> {}