import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadTheme } from '../features/themeSlice';
import { Loader2Icon } from 'lucide-react';
import { useUser, SignIn, useAuth, CreateOrganization } from '@clerk/clerk-react';
import { fetchWorkspaces } from '../features/workspaceSlice';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [fetchAttempts, setFetchAttempts] = useState(0);
    const { loading, workspaces } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    // Load theme
    useEffect(() => {
        dispatch(loadTheme());
    }, []);

    // ✅ Fetch workspaces - با لاگ برای دیباگ
    useEffect(() => {
        if (isLoaded && user) {
            console.log('🔍 User loaded, workspaces:', workspaces.length);
            if (workspaces.length === 0 && fetchAttempts < 5) {
                console.log(`🔄 Fetching workspaces (attempt ${fetchAttempts + 1})...`);
                dispatch(fetchWorkspaces(getToken));
                setFetchAttempts(prev => prev + 1);
            }
        }
    }, [user, isLoaded, workspaces.length, dispatch, getToken, fetchAttempts]);

    // ✅ وقتی workspace پیدا شد، ریدایرکت کن
    useEffect(() => {
        console.log('📊 Workspaces changed:', workspaces.length);
        if (workspaces.length > 0) {
            console.log('✅ Workspace found, redirecting to dashboard...');
            navigate('/', { replace: true });
        }
    }, [workspaces.length, navigate]);

    // اگر کاربر وارد نشده
    if (!user) {
        return (
            <div className='flex justify-center items-center h-screen bg-white dark:bg-zinc-950'>
                <SignIn />
            </div>
        );
    }

    // اگر در حال بارگذاری
    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    // اگر کاربر workspace نداشته باشد
    if (user && workspaces.length === 0) {
        console.log('🏠 No workspace found, showing CreateOrganization');
        return (
            <div className='min-h-screen flex justify-center items-center bg-white dark:bg-zinc-950'>
                <CreateOrganization />
            </div>
        );
    }

    // نمایش صفحه اصلی
    console.log('🎯 Rendering main layout with', workspaces.length, 'workspaces');
    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;