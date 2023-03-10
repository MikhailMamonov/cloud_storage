import { useAppDispatch } from './../../hooks/useSelector';
import { UploadedFile } from '../types/uploader';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  IFile,
  CreateDirProps,
  UploadFileProps,
  GetFilesProps,
} from './../types/files';

import axios from 'api';
import {
  addUploadFile,
  changeUploadFile,
  hideUploader,
  showUploader,
} from '../features/uploader/uploaderSlice';
import { hideLoader, setError, showLoader } from '../features/app/appSlice';
import { setUser } from '../features/auth/authSlice';

export const getFiles = createAsyncThunk<Array<IFile>, GetFilesProps>(
  'file/getFiles',
  async ({ dirId, sort }, thunkAPI) => {
    try {
      thunkAPI.dispatch(showLoader());
      let url = ``;
      if (dirId) {
        url = `?parent=${dirId}`;
      }
      if (sort) {
        url = `?sort=${sort}`;
      }
      if (dirId && sort) {
        url = `?parent=${dirId}&sort=${sort}`;
      }
      const response = await axios.get(`files${url}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    } catch (err: any) {
      thunkAPI.dispatch(setError(err));
      throw err;
    } finally {
      thunkAPI.dispatch(hideLoader());
    }
  }
);

export const createDir = createAsyncThunk<IFile, CreateDirProps>(
  'file/createDir',
  async ({ dirId, name }, thunkAPI) => {
    try {
      const response = await axios.post(
        `files`,
        {
          name,
          parent: dirId,
          type: 'dir',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      return response.data;
    } catch (err: any) {
      thunkAPI.dispatch(setError(err));
      throw err;
    }
  }
);

export const uploadFile = createAsyncThunk<IFile, UploadFileProps>(
  'file/uploadFile',
  async ({ file, dirId }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (dirId) {
        formData.append('parent', dirId);
      }

      const uploadedFile = {
        name: file.name,
        progress: 0,
        id: Date.now(),
      } as UploadedFile;
      thunkAPI.dispatch(showUploader());
      thunkAPI.dispatch(addUploadFile(uploadedFile));

      const response = await axios.post(`files/upload`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        onUploadProgress: (progressEvent) => {
          console.log('total', progressEvent.total);
          if (progressEvent.total) {
            uploadedFile.progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            thunkAPI.dispatch(changeUploadFile(uploadedFile));
          }
        },
      });
      return response.data;
    } catch (err: any) {
      thunkAPI.dispatch(hideUploader());
      thunkAPI.dispatch(setError(err));
      throw err;
    }
  }
);

export const downloadFile = async (file: IFile) => {
  await fetch(`http://localhost:8080/api/files/download?id=${file._id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
    .then(async (response) => {
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        return Promise.reject(await response.json());
      }
    })
    .catch((err) => {
      useAppDispatch()(setError(err));
      throw err;
    });
};

export const searchFiles = createAsyncThunk<IFile[], string>(
  'file/searchFiles',
  async (search, thunkAPI) => {
    try {
      const response = await axios.get(`files/search?search=${search}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    } catch (err: any) {
      thunkAPI.dispatch(setError(err));
      throw err;
    } finally {
      thunkAPI.dispatch(hideLoader());
    }
  }
);

export const deleteFile = createAsyncThunk<string, IFile>(
  'file/deleteFile',
  async (file, thunkAPI) => {
    try {
      const response = await axios.delete(`files?id=${file._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(response.data.message);
      return file._id;
    } catch (err: any) {
      thunkAPI.dispatch(setError(err));
      throw err;
    }
  }
);

export const uploadAvatar = createAsyncThunk<void, File>(
  'file/uploadAvatar',
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`files/avatar`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(response.data.message);
      thunkAPI.dispatch(setUser(response.data));
    } catch (err: any) {
      thunkAPI.dispatch(setError(err));
      throw err;
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'file/uploadAvatar',
  async (data, thunkAPI) => {
    try {
      const response = await axios.delete(`files/avatar`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      thunkAPI.dispatch(setUser(response.data));
    } catch (err: any) {
      thunkAPI.dispatch(setError(err));
      throw err;
    }
  }
);
