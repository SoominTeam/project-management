import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadTheme } from '../features/themeSlice';
import { Loader2Icon } from 'lucide-react';
import { useUser, SignIn, useAuth, CreateOrganization, useOrganization } from '@clerk/clerk-react';
import { fetchWorkspaces } from '../features/workspaceSlice';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const checkInterval = useRef(null);
    const { loading, workspaces } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const { organization } = useOrganization();

    // Load theme
    useEffect(() => {
        dispatch(loadTheme());
    }, []);

    // ✅ وقتی organization ساخته شد، شروع به چک کردن workspace کن
    useEffect(() => {
        if (organization && workspaces.length === 0 && !isChecking) {
            setIsChecking(true);
            console.log('🏢 Organization created, checking for workspace...');
            
            // هر 2 ثانیه یکبار چک کن
            checkInterval.current = setInterval(async () => {
                console.log('🔄 Checking for workspace...');
                const result = await dispatch(fetchWorkspaces(getToken));
                if (result.payload && result.payload.length > 0) {
                    console.log('✅ Workspace found!');
                    clearInterval(checkInterval.current);
                    setIsChecking(false);
                    navigate('/', { replace: true });
                }
            }, 2000);

            // بعد از 15 ثانیه اگر پیدا نشد، دیگه چک نکن
            setTimeout(() => {
                if (checkInterval.current) {
                    clearInterval(checkInterval.current);
                    setIsChecking(false);
                    console.log('⏰ Timeout: No workspace found after 15 seconds');
                }
            }, 15000);
        }

        return () => {
            if (checkInterval.current) {
                clearInterval(checkInterval.current);
            }
        };
    }, [organization, workspaces.length, isChecking, dispatch, getToken, navigate]);

    // ✅ اگر workspace پیدا شد، ریدایرکت کن
    useEffect(() => {
        if (workspaces.length > 0) {
            console.log('✅ Workspace detected, redirecting...');
            if (checkInterval.current) {
                clearInterval(checkInterval.current);
            }
            setIsChecking(false);
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

    // اگر در حال بارگذاری یا چک کردن
    if (loading || isChecking) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <div className='flex flex-col items-center gap-4'>
                    <Loader2Icon className="size-10 text-blue-500 animate-spin" />
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {isChecking ? 'Creating your workspace...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    // اگر کاربر workspace نداشته باشد
    if (user && workspaces.length === 0) {
        return (
            <div className='min-h-screen flex justify-center items-center bg-white dark:bg-zinc-950'>
                <CreateOrganization />
            </div>
        );
    }

    // نمایش صفحه اصلی
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