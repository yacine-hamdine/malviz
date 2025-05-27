import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Submit from './pages/Submit.jsx'
import Result from './pages/Result.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/App.css';

const Router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,  // Wrap everything in Layout
    children: [
      { path: '/', element: <Home /> },
      { path: '/submit', element: <Submit /> },
      { path: '/result', element: <Result /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function App() {

  return (
    <RouterProvider router={Router} />
  )
}

export default App