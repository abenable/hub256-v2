import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Chart from './pages/Chart';
import Hub256 from './pages/Dashboard/hub256';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import EditProfile from './pages/EditProfile';
import CreateBlog from './pages/createBlog';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="Dashboard" />
              <Hub256 />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile" />
              <Profile />
            </>
          }
        />

        <Route
          path="/editprofile"
          element={
            <>
              <PageTitle title="Edit Profile" />
              <EditProfile />
            </>
          }
        />
        <Route
          path="/createblog"
          element={
            <>
              <PageTitle title="New Blog" />
              <CreateBlog />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <PageTitle title="Login" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <PageTitle title="Register" />
              <SignUp />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
