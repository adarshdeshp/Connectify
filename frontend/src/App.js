import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route,  Routes} from 'react-router-dom';
import LandingPage from './pages/landing';
import Authetication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeet from './pages/VideoMeet';
import HOME from './pages/home';
import History from './pages/history';

function App() {
  return (
  <>
  <BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/auth' element={<Authetication/>}/>
      <Route path='/home' element={<HOME/>}/>
      <Route path='/history' element={<History/>}/>
      <Route path='/:url' element={<VideoMeet/>}/>
    </Routes>
    </AuthProvider>
  </BrowserRouter>
  </>
  );
}

export default App;
