export interface PageRoute {
  id: number;
  page_name: string;
  page_url: string;
  status: string;
}

export interface FindPagesResponse {
  status: string;
  available_routes: PageRoute[];
}

export interface AvailableRoutesResponse extends Array<PageRoute> {}