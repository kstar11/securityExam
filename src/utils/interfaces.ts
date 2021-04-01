import { Dispatch } from 'redux';

interface AppModel {
  loading: boolean;
  userInfo?: UserModel;
}

export interface UserQueryModel {
  UserName: string;
  MobilePhone?: number | string;
}

export interface UserModel {
  UserNum: string;
  UserName: string;
  MobilePhone: string;
  EncryptMobilePhone?: string;
  LastVisit?: Date | string;
  RoleId: number | string;
  RoleName: string;
  DataRights: number | string;
  OrganizationId: number | string;
  OrganizationLink: string;
  OrganizationName: string;
}

export interface PageModel {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface UmiComponentProps {
  history: History;
  dispatch: Dispatch<any>;
}

export interface AppState {
  app: AppModel;
}

export interface OptionModel {
  headers?: any;
}

export interface PasswordModel {
  userNum?: number | string;
  pwd: string;
  newpwd: string;
  copyNewpwd: string;
}

export interface error {
  name: string;
  data: any;
  type: string;
  response: {
    status: number;
    statusText: string;
    url: string;
  };
}
