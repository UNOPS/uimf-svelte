import { IClientFunction } from "../IClientFunction";

export class AppLogout implements IClientFunction {
	name: string = "app-logout";

	handle(_params?: any): void {
		fetch("/api/Account/Logout", { method: "POST" })
			.then(() => {
				try {
					localStorage.removeItem("Token");
					sessionStorage.removeItem("metadata");
				} catch { }

				if (location.hash && location.hash !== "#/home") {
					location.hash = "#/home";
				} else {
					window.location.href = "#/home";
				}
			})
			.catch((msg) => {
				console.log(msg);
			});
	}
}