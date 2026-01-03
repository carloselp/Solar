export class AppConstants {

    public static get baseUrl(): string { return "https://inovecode-back.azurewebsites.net/"}
    public static get baseLogin(): string { return this.baseUrl + 'api/Login/v1' }
    public static get baseUser(): string { return this.baseUrl + 'api/Users/v1' }
    public static get baseSystemProfileUsers(): string { return this.baseUrl + 'api/SystemProfileUsers/v1' }
    public static get baseSystemPageUsers(): string { return this.baseUrl + 'api/SystemPageUsers/v1' }
    public static get baseSystemPages(): string { return this.baseUrl + 'api/SystemPages/v1' }
    public static get baseSystemPageProfiles(): string { return this.baseUrl + 'api/SystemPageProfiles/v1' }
    public static get baseSystemProfiles(): string { return this.baseUrl + 'api/SystemProfiles/v1' }
    public static get baseSolarPlant(): string { return this.baseUrl + 'api/SystemSolarplants/v1' }
    public static get baseSolarInverter(): string { return this.baseUrl + 'api/SystemSolarinverters/v1' }
    public static get baseDashboardSolarplant(): string { return this.baseUrl + 'api/Dashboard/Solarplant/v1' }
    public static get baseAlert(): string { return this.baseUrl + 'api/Alert/v1' }

}