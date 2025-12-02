import Chat from './pages/Chat';
import Documents from './pages/Documents';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Documents": Documents,
}

export const pagesConfig = {
    mainPage: "Chat",
    Pages: PAGES,
    Layout: __Layout,
};