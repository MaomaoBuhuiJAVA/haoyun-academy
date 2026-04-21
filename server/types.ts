export type Resource = {
  id: number;
  title: string;
  image: string;
  filterTag: string;
  tags: string[];
  readTime: string;
  colSpan: string;
  author: string;
  content: string;
  status: "published" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type Favorite = {
  userId: string;
  resourceId: number;
  createdAt: string;
};

export type Submission = {
  id: number;
  userId: string;
  title: string;
  category: string;
  tags: string[];
  coverImage?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewerNote?: string;
};

export type Store = {
  resources: Resource[];
  favorites: Favorite[];
  submissions: Submission[];
};

