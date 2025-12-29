import  { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Static CSS and Components
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';

// 1. Lazy Loading Components
// These will only download when the user navigates to the route
const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const Profile = lazy(() => import('./components/Profile'));
const Browse = lazy(() => import('./components/Browse'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Matches = lazy(() => import('./components/Matches'));
const ChatPage = lazy(() => import('./components/ChatPage'));
const Inbox = lazy(() => import('./components/Inbox'));

// 2. Loading Fallback
// A simple spinner to show while the component chunk is loading
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <div className="loader"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Header />

      <div className="main-content">
        {/* 3. Suspense wraps the routes to handle the loading state */}
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Private Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Matching & Messaging */}
            <Route path="/matches" element={<Matches />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/chat/:userId" element={<ChatPage />} />
          </Routes>
        </Suspense>
      </div>

      <ToastContainer 
        position="bottom-right" 
        autoClose={4000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{ backgroundColor: "#e91e63" }} 
      />
    </Router>
  );
}

export default App;