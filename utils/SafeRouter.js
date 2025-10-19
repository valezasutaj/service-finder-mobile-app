import { router } from "expo-router";

class SafeRouter {
    constructor() {
        this.lastPath = null;
    }

    push(path) {
        if (this.lastPath === path) {
            return;
        }
        this.lastPath = path;
        router.push(path);
    }

    replace(path) {
        if (this.lastPath === path) {
            return;
        }
        this.lastPath = path;
        router.replace(path);
    }

    back() {
        this.lastPath = null;
        router.back();
    }

    get native() {
        return router;
    }
}

export const safeRouter = new SafeRouter();
