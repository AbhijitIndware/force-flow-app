export interface UserManualVideo {
  video_id: string;
  title: string;
  description: string;
  duration: string;
  duration_seconds: number;
  source: string;
  is_external: boolean;
  url: string;
  thumbnail: string | null;
  file_size: string;
  language: string;
  restricted_to: string[];
}

export interface UserManualSection {
  category: string;
  category_name: string;
  icon: string;
  description: string;
  sequence: number;
  video_count: number;
  videos: UserManualVideo[];
}

export interface UserManualCategory {
  category: string;
  category_name: string;
  icon: string;
  sequence: number;
  video_count: number;
}

export interface UserManualData {
  total_videos: number;
  total_sections: number;
  languages: string[];
  sections: UserManualSection[];
}

export interface UserManualResponse {
  success: boolean;
  data: UserManualData;
}

export interface UserManualCategoriesData {
  categories: UserManualCategory[];
}

export interface UserManualCategoriesResponse {
  success: boolean;
  data: UserManualCategoriesData;
}

export interface UserManualVideoResponse {
  success: boolean;
  data: {
    video: UserManualVideo;
  };
}

export interface UserManualParams {
  category?: string;
  language?: string;
  search?: string;
}
