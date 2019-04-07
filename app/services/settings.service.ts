import * as fs from "fs"
import { Subject } from "rxjs"
const PATH = "app-settings.json";

export class SettingsService {

    private settings = {};
    private hasLoaded: Subject<any> = new Subject<any>();

    constructor() {
        fs.open(PATH, 'r+', (err, fd) => {
            if (err) {
                /* Create a new file with default settings */
                const defaultSettings = { theme: 'default' };
                fs.writeFileSync(PATH, JSON.stringify(defaultSettings));
                fs.close(fd, (err) => {
                    if (err) console.log("settings.service.ts, Line 17. Error is: " + err);
                });
            } else {
                /* Load setting if file exists */
                let data = fs.readFileSync(PATH);
                /* Fetch settings */
                this.settings = JSON.parse(data.toString('utf-8'));
                this.hasLoaded.next(null);
            }
            fs.close(fd, (err) => {
                if (err) console.log("settings.service.ts, Line 27. Error is: " + err);
            });
        });
    }

    public getSetting(settingKey: string): string {
        return this.settings[settingKey];
    }

    public saveSettingToFile(settingKey: string, settingValue: string): void {
        this.settings[settingKey] = settingValue;
        fs.writeFileSync(PATH, JSON.stringify(this.settings));
    }

    public doneLoading(): Subject<any> {
        return this.hasLoaded;
    }
}
