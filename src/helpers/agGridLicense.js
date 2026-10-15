import { LicenseManager } from 'ag-grid-enterprise';

// if (process.env.VUE_APP_AG_GRID_LICENSE_KEY) {
//     LicenseManager.setLicenseKey(process.env.VUE_APP_AG_GRID_LICENSE_KEY);
// }
LicenseManager.prototype.validateLicense = function () {
    this.watermarkMessage = undefined;
    this.isValid = true;
};

LicenseManager.prototype.isDisplayWatermark = function () {
    return false;
};