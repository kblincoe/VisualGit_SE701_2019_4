import { Injectable, ComponentStillLoadingError } from "@angular/core";
import { SettingsService } from "./settings.service";

const elements = [
    'navbar',
    'navbar-btn',
    'fa',
    'file-panel',
    'p',
    'h1',
    'diff-panel-body',
    'my-network',
    'footer',
    'add-repository-panel',
    'authenticate',
    'button-clone',
    'commit-button'
];

const themeColor = [
    'white',
    'pink',
    'blue',
    'navy',
    'green',
    'default'
]

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
        "#D6D6D6"
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

        "#FFD7D7"
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

        "#B6DEFF"
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
        "#CCE0FF"
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

        "#ADEBAD"
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
        "#282828"
    ]
]

const DEFAULT_THEME_INDEX = 5;

@Injectable()
export class ThemeService {

    private theme: string;
    private before: string;

    constructor(private settingsService: SettingsService) {

        /* Call init method to get previous theme */
        this.settingsService.doneLoading().subscribe(() =>{
            /* If theme is null, set to default */
            this.theme = this.settingsService.getSetting('theme');
            this.theme = this.theme ? this.theme : 'default';
            this.before = this.theme;
            this.setTheme(this.theme);
        });
    }


    public setTheme(theme: string) {

        /* Update app colors */
        this.theme = theme;
        this.setColors();
        this.settingsService.saveSettingToFile('theme', theme);
    }

    public getTheme(): string {
        return this.theme;
    }

    public setColors(): void {

        const head = document.getElementsByClassName(elements[0]);
        const headButton = document.getElementsByClassName(elements[1]);
        const fa = document.getElementsByClassName(elements[2]);
        const fp = document.getElementById(elements[3]);
        const p = document.getElementsByTagName(elements[4]);
        const h1 = document.getElementsByTagName(elements[5]);
        const diffp = document.getElementById(elements[6]);
        const network = document.getElementById(elements[7]);
        const footer = document.getElementById(elements[8]);
        const arp = document.getElementById(elements[9]);
        const auth = document.getElementById(elements[10]);
        const btnClone = document.getElementsByClassName(elements[11]);
        const btnCommit = document.getElementsByClassName(elements[12]);

        const themeIndex = this.getThemeIndex();

        if (head) {
            for (let i = 0; i < head.length; i++) {
                head[i].className = themeClasses[themeIndex][0];
            }
        }
        if (headButton) {
            for (let i = 0; i < headButton.length; i++) {
                if (this.before === "default") {
                    headButton[i].classList.remove(themeClasses[themeIndex][1]);
                }
                headButton[i].classList.add(themeClasses[themeIndex][2]);
            }
        }
        if (fa) {
            for (let i = 0; i < fa.length; i++) {
                fa[i].setAttribute("style", themeClasses[themeIndex][3]);
            }
        }
        if (fp) {
            fp.setAttribute("style", themeClasses[themeIndex][4]);
        }

        if (p) {
            for (let i = 0; i < p.length; i++) {
                p[i].style.color = themeClasses[themeIndex][5];
            }
        }

        if (h1) {
            for (let i = 0; i < h1.length; i++) {
                h1[i].style.color = themeClasses[themeIndex][6];
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

        if (btnClone) {
            for (let j = 0; j < btnClone.length; j++) {
                btnClone[j].classList.remove(themeClasses[themeIndex][1]);
                btnClone[j].classList.remove(themeClasses[themeIndex][2]);
                btnClone[j].classList.add(themeClasses[themeIndex][1]);
            }
        }
        
        if (btnCommit) {
            for (let j = 0; j < btnCommit.length; j++) {
                btnCommit[j].classList.remove(themeClasses[themeIndex][1]);
                btnCommit[j].classList.remove(themeClasses[themeIndex][2]);
                btnCommit[j].classList.add(themeClasses[themeIndex][1]);
            }
        }
        
        /* Special cases for certain colours */
        if (this.theme === 'pink' || this.theme === 'blue' || this.theme === 'navy' || this.theme === 'green') {
            if (footer) {
                footer.style.border = themeClasses[themeIndex][13];
            }
            
        }
        
        if (this.theme === 'navy') {
            if (network) {
                network.style.border = themeClasses[themeIndex][14];
            }
        }
        this.before = this.theme;
        
    }

    private getThemeIndex(): number {
        
        for (var i = 0;i <themeColor.length; i++) {
            if (themeColor[i] === this.theme) {
                return i;
            }
        }
        return DEFAULT_THEME_INDEX;
    }
}