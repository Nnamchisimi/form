export const Icon = ({ path, viewBox = '0 0 448 512', size = 16, style = {}, className = '', ...rest }) => (
  <svg
    viewBox={viewBox}
    width={size}
    height={size}
    fill="currentColor"
    style={style}
    className={className}
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <path d={path} />
  </svg>
);

export const ChevronDown = (props) => (
  <Icon {...props} path="M8 151L216 300l-208 149 240-176L8 151z" viewBox="0 0 320 512" />
);

export const Upload = (props) => (
  <Icon {...props} path="M256 0l-128 128h64v192h64v-192h64zM128 448l160-160 32 32-160 160-160-160 32-32z" viewBox="0 0 320 512" />
);

export const Save = (props) => (
  <Icon {...props} path="M128 0l128 64v128h64v128h-64v128l-128-64v-128h-64v-128h64v-128z" viewBox="0 0 320 512" />
);

export const Check = (props) => (
  <Icon {...props} path="M480 32l-288 288-112-112 48-48 112 112 240-240z" viewBox="0 0 512 512" />
);

export const Trash = (props) => (
  <Icon {...props} path="M32 416h480l-48-384h-384zM160 416v32h192v-32M128 160h256v32h-256z" viewBox="0 0 512 512" />
);

export const Download = (props) => (
  <Icon {...props} path="M256 0l-128 128h64v192h64v-192h64zM128 448l160-160 32 32-160 160-160-160 32-32z" viewBox="0 0 320 512" />
);

export const Users = (props) => (
  <Icon {...props} path="M160 192c35-35 70-35 105 0s35 70 0 105-70 35-105 0-35-70 0-105zM320 192c35-35 70-35 105 0s35 70 0 105-70 35-105 0-35-70 0-105zM0 384c35-35 70-35 105 0s35 70 0 105-70 35-105 0-35-70 0-105z" viewBox="0 0 512 512" />
);

export const ArrowLeft = (props) => (
  <Icon {...props} path="M320 256l-192 192 48 48 192-192-192-192zM64 256l192-192-48-48-192 192 192 192z" viewBox="0 0 320 512" />
);

export const Globe = (props) => (
  <Icon {...props} path="M256 8c-136.8 0-248 111.2-248 248s111.2 248 248 248 248-111.2 248-248-111.2-248-248-248zM256 464c-114.7 0-208-93.3-208-208s93.3-208 208-208 208 93.3 208 208-208 208-208 208z" viewBox="0 0 512 512" />
);

export const Menu = (props) => (
  <Icon {...props} path="M0 96h512v128H0zM0 256h512v128H0zM0 416h512v128H0z" viewBox="0 0 512 512" />
);

export const Mail = (props) => (
  <Icon {...props} path="M512 128L256 288 0 128v64l256 160 256-160v-64zM0 448l256-160 256 160v-320L256 128 0 128v320z" viewBox="0 0 512 512" />
);

export const Clock = (props) => (
  <Icon {...props} path="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM288 192h64v96h-64v-96zM256 368c-61.9 0-112-50.1-112-112s50.1-112 112-112s112 50.1 112 112S317.9 368 256 368z" viewBox="0 0 512 512" />
);

export const Star = (props) => (
  <Icon {...props} path="M0 192l119.3-18.2L256 0l136.7 173.8L512 192l-150.2 93.7L407.4 512 256 398.9 104.6 512l15.7-226.3L0 192z" viewBox="0 0 512 512" />
);
