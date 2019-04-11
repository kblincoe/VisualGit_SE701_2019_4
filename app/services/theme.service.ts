import { Injectable } from "@angular/core";
import { SettingsService } from "./settings.service";

const elements = [
    "navbar",
    "navbar-btn",
    "fa",
    "file-panel",
    "p",
    "h1",
    "diff-panel-body",
    "my-network",
    "footer",
    "add-repository-panel",
    "authenticate",
    "button-clone",
    "commit-button",
    "header-icon",
];

const themeColor = [
    "white",
    "pink",
    "blue",
    "navy",
    "green",
    "default",
];

const themeClasses = [
    // White
    [
        "navbar navbar-white",
        "btn-inverse",
        "btn-default",
        "color:#a8abaf",
        "background-color:#E3E3E3",
        "black",
        "#5E5E5E",
        "#D2D3D4",
        "#616161",
        "#D6D6D6",
        "#E3E3E3",
        "#D1D1D1",
        "#D6D6D6",
        "#5E5E5E",
    ],
    // Pink
    [
        "navbar navbar-pink",
        "btn-inverse",
        "btn-default",
        "color:white",
        "background-color: #FFC2C2",
        "#767676",
        "#FFA3A3",
        "white",
        "white",
        "#FFE5E5",
        "#FFD7D7",
        "#FFD7D7",
        "#FFE5E5",
        "#FFD7D7",
        "#FFFFFF",
    ],
    // Blue
    [
        "navbar navbar-blue",
        "btn-inverse",
        "btn-default",
        "color:white",
        "background-color: #9DD2FE",
        "#767676",
        "#4EAFFE",
        "white",
        "white",
        "#EEF6FF",
        "#B6DEFF",
        "#DAEEFF",
        "#DAEEFF",
        "#B6DEFF",
        "#FFFFFF",
    ],
    // Navy
    [
        "navbar navbar-navy",
        "btn-inverse",
        "btn-default",
        "color:white",
        "background-color: #0066FF",
        "white",
        "#001C83",
        "white",
        "white",
        "#CCE0FF",
        "#4D94FF",
        "#4D94FF",
        "#4D94FF",
        "#4D94FF",
        "#CCE0FF",
        "#FFFFFF",
    ],
    // Green
    [
        "navbar navbar-green",
        "btn-inverse",
        "btn-default",
        "color:white",
        "background-color: #5CD65C",
        "white",
        "#00990d",
        "white",
        "white",
        "#EBFAEB",
        "#ADEBAD",
        "#ADEBAD",
        "#ADEBAD",
        "#ADEBAD",
        "#FFFFFF",
    ],
    // Default
    [
        "navbar navbar-inverse",
        "btn-default",
        "btn-inverse",
        "color:white",
        "background-color:#282828",
        "#ccc",
        "#ccc",
        "#fff",
        "#282828",
        "#181818",
        "#282828",
        "#282828",
        "#282828",
        "#FFFFFF",
    ],
];

const DEFAULT_THEME_INDEX = 5;

@Injectable()
export class ThemeService {

    private theme: string;
    private before: string;

    constructor(private settingsService: SettingsService) {

        /* Call init method to get previous theme */
        this.settingsService.doneLoading().subscribe(() => {
            /* If theme is null, set to default */
            this.theme = this.settingsService.getSetting("theme");
            this.theme = this.theme ? this.theme : "default";
            this.before = this.theme;
            this.setTheme(this.theme);
        });
    }

    public setTheme(theme: string) {
        /* Update app colors */
        this.theme = theme;
        this.setColors();
        this.settingsService.saveSettingToFile("theme", theme);
    }

    public getTheme(): string {
        return this.theme;
    }

    public setColors(): void {
        const navBarElements: HTMLCollectionOf<Element> = document.getElementsByClassName(elements[0]);
        const navButtons: HTMLCollectionOf<Element> = document.getElementsByClassName(elements[1]);
        const faElements: HTMLCollectionOf<Element> = document.getElementsByClassName(elements[2]);
        const fp: HTMLElement = document.getElementById(elements[3]);
        const pElements: HTMLCollectionOf<Element> = document.getElementsByTagName(elements[4]);
        const h1Elements: HTMLCollectionOf<Element> = document.getElementsByTagName(elements[5]);
        const diffp: HTMLElement = document.getElementById(elements[6]);
        const network: HTMLElement = document.getElementById(elements[7]);
        const footer: HTMLElement = document.getElementById(elements[8]);
        const arp: HTMLElement = document.getElementById(elements[9]);
        const auth: HTMLElement = document.getElementById(elements[10]);
        const btnClones: HTMLCollectionOf<Element> = document.getElementsByClassName(elements[11]);
        const btnCommits: HTMLCollectionOf<Element> = document.getElementsByClassName(elements[12]);
        const headerIcons: HTMLCollectionOf<Element> = document.getElementsByClassName(elements[13]);

        const themeIndex = this.getThemeIndex();

        if (navBarElements) {
            for (const navBarElement of navBarElements) {
                navBarElement.className = themeClasses[themeIndex][0];
            }
        }
        if (navButtons) {
            for (const navButton of navButtons) {
                if (this.before === "default") {
                    navButton.setAttribute("style", `color: ${themeClasses[themeIndex][1]}`);
                }
                navButton.classList.add(themeClasses[themeIndex][2]);
            }
        }
        if (faElements) {
            for (const fa of faElements) {
                fa.setAttribute("style", `color: ${themeClasses[themeIndex][3]}`);
            }
        }
        if (fp) {
            fp.setAttribute("style", `color: ${themeClasses[themeIndex][4]}`);
        }

        if (pElements) {
            for (const p of pElements) {
                p.setAttribute("style", themeClasses[themeIndex][5]);
            }
        }

        if (h1Elements) {
            for (const h1 of h1Elements) {
                h1.setAttribute("style", themeClasses[themeIndex][6]);
            }
        }

        if (diffp) {
            diffp.style.color = themeClasses[themeIndex][7];
            diffp.style.backgroundColor = themeClasses[themeIndex][8];
        }

        if (network) {
            network.style.backgroundColor = themeClasses[themeIndex][9];
        }

        if (footer) {
            footer.style.backgroundColor = themeClasses[themeIndex][10];
        }

        if (arp) {
            arp.style.backgroundColor = themeClasses[themeIndex][11];
        }
        if (auth) {
            auth.style.backgroundColor = themeClasses[themeIndex][12];
        }

        if (btnClones) {
            for (const btnClone of btnClones) {
                btnClone.classList.remove(themeClasses[themeIndex][1]);
                btnClone.classList.remove(themeClasses[themeIndex][2]);
                btnClone.classList.add(themeClasses[themeIndex][1]);
            }
        }

        if (btnCommits) {
            for (const btnCommit of btnCommits) {
                btnCommit.classList.remove(themeClasses[themeIndex][1]);
                btnCommit.classList.remove(themeClasses[themeIndex][2]);
                btnCommit.classList.add(themeClasses[themeIndex][1]);
            }
        }

        if (headerIcons) {
            for (const headerIcon of headerIcons) {
                headerIcon.setAttribute("style", `color: ${themeClasses[themeIndex][13]}`);
            }
        }

        /* Special cases for certain colours */
        if (this.theme === "pink" || this.theme === "blue" || this.theme === "navy" || this.theme === "green") {
            if (footer) {
                footer.style.border = themeClasses[themeIndex][13];
            }

        }

        if (this.theme === "navy") {
            if (network) {
                network.style.border = themeClasses[themeIndex][14];
            }
        }
        this.before = this.theme;
    }

    private getThemeIndex(): number {
        for (let i = 0; i < themeColor.length; i++) {
            if (themeColor[i] === this.theme) {
                return i;
            }
        }
        return DEFAULT_THEME_INDEX;
    }
}
