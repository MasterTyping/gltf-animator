import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          userSelect: "none",
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          userSelect: "none",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          userSelect: "none",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        // 컴포넌트의 루트 요소에 스타일을 적용합니다.
        root: {
          userSelect: "none",
        },
      },
    },
  },
});

export default theme;
