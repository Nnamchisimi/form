import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import ArchiveIcon from '@mui/icons-material/Archive';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadIcon from '@mui/icons-material/Upload';
import CheckIcon from '@mui/icons-material/Check';
import MailIcon from '@mui/icons-material/Mail';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const sizeToFontSize = (size) => {
  if (!size || size <= 16) return 'small';
  if (size <= 20) return 'medium';
  if (size <= 28) return 'large';
  return 'xlarge';
};

const wrapMuiIcon = (MuiIcon) => {
  return ({ size, style, className, ...rest }) => {
    const mergedStyle = { ...style, verticalAlign: 'middle' };
    return (
      <MuiIcon
        className={className}
        fontSize={sizeToFontSize(size)}
        sx={{ width: size ? size : undefined, height: size ? size : undefined, ...(style ? { style: mergedStyle } : {}) }}
        {...rest}
      />
    );
  };
};

export const ArrowLeft = wrapMuiIcon(ArrowBackIcon);
export const Download = wrapMuiIcon(DownloadIcon);
export const Users = wrapMuiIcon(PeopleIcon);
export const Archive = wrapMuiIcon(ArchiveIcon);
export const LogOut = wrapMuiIcon(LogoutIcon);
export const Upload = wrapMuiIcon(UploadIcon);
export const Check = wrapMuiIcon(CheckIcon);
export const Mail = wrapMuiIcon(MailIcon);
export const Clock = wrapMuiIcon(ScheduleIcon);
export const Star = wrapMuiIcon(StarIcon);
export const ChevronDown = wrapMuiIcon(ExpandMoreIcon);
export const Save = wrapMuiIcon(SaveIcon);
export const Trash = wrapMuiIcon(DeleteIcon);
