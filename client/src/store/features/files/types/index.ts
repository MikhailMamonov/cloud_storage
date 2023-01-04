export interface IFile {
  id: string;
  name: string;
  type: string;
  accessLink?: string;
  size: number;
  path: string;
  date: string;
  user: string;
  parent: string;
  childs: [string];
}

export interface FileState {
  files: Array<IFile>;
  currentDir: string | null;
  popupDisplay: string;
}

export interface CreateDirProps {
  dirId: string;
  name: string;
}

export interface ValidationErrors {
  message: string;
  errors: Array<string>;
}
