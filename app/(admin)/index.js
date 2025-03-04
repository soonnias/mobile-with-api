 import { Redirect } from 'expo-router';

export default function Index() {
    return <Redirect href="/(admin)/patients" />;
}

/*import { useEffect } from "react";
import { Redirect } from "expo-router";
import { AuthService } from "../../api/authService";
import { useState } from "react";

export default function Index() {
    const [loggedOut, setLoggedOut] = useState(false);

    useEffect(() => {
        const logoutAndRedirect = async () => {
            await AuthService.logout();
            setLoggedOut(true);
        };

        logoutAndRedirect();
    }, []);

    if (loggedOut) {
        return <Redirect href="/login" />;
    }

    return null;
}*/