/**
 * Quantity Nexus - Core Application
 * Handles dashboard interactions and measurement logic
 */

import { AuthService } from './auth.js';
import { HistoryService } from './history.js';

class QuantityApp {
    constructor() {
        this.auth = new AuthService();
        this.historyMgr = new HistoryService();
        this.currentUser = this.auth.checkAuth();
        this.currentType = 'Length';
        this.currentAction = 'Conversion';
        this.units = {
            Length: { 'Meters': 1, 'Kilometers': 1000, 'Centimeters': 0.01, 'Millimeters': 0.001, 'Inch': 0.0254, 'Feet': 0.3048 },
            Weight: { 'Grams': 1, 'Kilograms': 1000, 'Tonnes': 1000000, 'Pounds': 453.592, 'Ounces': 28.3495 },
            Temperature: { 'Celsius': 'C', 'Fahrenheit': 'F', 'Kelvin': 'K' },
            Volume: { 'Litre': 1, 'Millilitre': 0.001, 'Gallon': 3.78541 },
            Area: { 'SquareMeter': 1, 'SquareFoot': 0.092903, 'Acre': 4046.86, 'SquareInch': 0.00064516 },
            Angle: { 'Degree': 1, 'Radian': 180 / Math.PI, 'Gradian': 0.9 },
            Speed: { 'MetersPerSecond': 1, 'KilometersPerHour': 1/3.6, 'MilesPerHour': 0.44704, 'Knots': 0.514444 },
            Time: { 'Second': 1, 'Minute': 60, 'Hour': 3600, 'Day': 86400 }
        };

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderUser();
        this.renderUnits();
        this.historyMgr.render();
    }

    cacheDOM() {
        this.displayName = document.getElementById('display-name');
        this.userAvatar = document.getElementById('user-avatar');
        this.fromUnit = document.getElementById('from-unit');
        this.toUnit = document.getElementById('to-unit');
        this.fromValue = document.getElementById('from-value');
        this.toValue = document.getElementById('to-value');
        this.unitTypes = document.querySelectorAll('.type-btn');
        this.actionBtns = document.querySelectorAll('.action-btn');
        this.conversionUI = document.getElementById('conversion-inputs');
        this.arithmeticUI = document.getElementById('arithmetic-inputs');
        this.unitSearch = document.getElementById('unit-search');
    }

    bindEvents() {
        this.unitTypes.forEach(btn => btn.addEventListener('click', () => this.switchUnitType(btn)));
        this.actionBtns.forEach(btn => btn.addEventListener('click', () => this.switchAction(btn)));

        this.fromValue.addEventListener('input', () => this.performConversion());
        this.fromUnit.addEventListener('change', () => this.performConversion());
        this.toUnit.addEventListener('change', () => this.performConversion());

        document.getElementById('val1').addEventListener('input', () => this.performArithmetic());
        document.getElementById('val2').addEventListener('input', () => this.performArithmetic());
        document.getElementById('unit1').addEventListener('change', () => this.performArithmetic());
        document.getElementById('unit2').addEventListener('change', () => this.performArithmetic());
        document.getElementById('result-unit').addEventListener('change', () => this.performArithmetic());
        document.getElementById('calc-op').addEventListener('change', () => this.performArithmetic());

        this.unitSearch?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        const authBtn = document.getElementById('logout-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.auth.logout();
                } else {
                    window.location.href = 'login.html';
                }
            });
        }
        document.getElementById('swap-trigger')?.addEventListener('click', () => this.swapUnits());
    }

    renderUser() {
        const authBtn = document.getElementById('logout-btn');
        if (!this.currentUser) {
            this.displayName.textContent = 'Guest';
            this.userAvatar.innerHTML = '<i data-lucide="user"></i>';
            if (authBtn) {
                authBtn.innerHTML = '<i data-lucide="log-in"></i><span>Sign In</span>';
            }
            return;
        }
        this.displayName.textContent = this.currentUser.fullName.split(' ')[0];
        this.userAvatar.textContent = this.currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        if (authBtn) {
            authBtn.innerHTML = '<i data-lucide="log-out"></i><span>Logout</span>';
        }
    }

    switchUnitType(btn) {
        this.unitTypes.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentType = btn.dataset.unit;
        this.renderUnits();
        this.performCurrentAction();
    }

    switchAction(btn) {
        this.actionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentAction = btn.dataset.action;

        if (this.currentAction === 'Arithmetic') {
            this.conversionUI.classList.add('hidden');
            this.arithmeticUI.classList.remove('hidden');
        } else {
            this.conversionUI.classList.remove('hidden');
            this.arithmeticUI.classList.add('hidden');
        }
        this.performCurrentAction();
    }

    renderUnits() {
        const unitList = Object.keys(this.units[this.currentType]);
        const options = unitList.map(u => `<option value="${u}">${u}</option>`).join('');

        ['from-unit', 'to-unit', 'unit1', 'unit2', 'result-unit'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = options;
        });

        if (this.toUnit) this.toUnit.selectedIndex = unitList.length > 1 ? 1 : 0;
        this.performCurrentAction();
    }

    swapUnits() {
        const temp = this.fromUnit.value;
        this.fromUnit.value = this.toUnit.value;
        this.toUnit.value = temp;
        this.performCurrentAction();
    }

    performCurrentAction() {
        this.currentAction === 'Arithmetic' ? this.performArithmetic() : this.performConversion();
    }

    performConversion() {
        const value = parseFloat(this.fromValue.value) || 0;
        const uFrom = this.fromUnit.value;
        const uTo = this.toUnit.value;

        let result = this.currentType === 'Temperature' 
            ? this.convertTemperature(value, uFrom, uTo) 
            : (value * this.units[this.currentType][uFrom]) / this.units[this.currentType][uTo];

        this.toValue.textContent = result.toFixed(3);
        if (value > 0) this.historyMgr.add(this.currentType, `${value} ${uFrom}`, `${result.toFixed(3)} ${uTo}`);
    }

    performArithmetic() {
        if (this.currentType === 'Temperature') return; // Arithmetic not supported for Temp

        const v1 = parseFloat(document.getElementById('val1').value) || 0;
        const v2 = parseFloat(document.getElementById('val2').value) || 0;
        const u1 = document.getElementById('unit1').value;
        const u2 = document.getElementById('unit2').value;
        const uResSelect = document.getElementById('result-unit');
        const op = document.getElementById('calc-op').value;

        const baseV1 = v1 * this.units[this.currentType][u1];
        const baseV2 = v2 * this.units[this.currentType][u2];
        
        let res;
        
        if (op === 'div') {
            // Division yields a dimensionless result, so we disable the target unit dropdown.
            uResSelect.disabled = true;
            uResSelect.style.opacity = '0.4';
            
            if (baseV2 === 0) {
                document.getElementById('calc-result').textContent = 'Err';
                return;
            }
            res = baseV1 / baseV2;
        } else {
            // Addition / Subtraction
            uResSelect.disabled = false;
            uResSelect.style.opacity = '1';
            const uRes = uResSelect.value;
            res = (op === 'add' ? baseV1 + baseV2 : baseV1 - baseV2) / this.units[this.currentType][uRes];
        }

        document.getElementById('calc-result').textContent = res.toFixed(3);
    }

    convertTemperature(val, from, to) {
        if (from === to) return val;
        let c = from === 'Celsius' ? val : from === 'Fahrenheit' ? (val - 32) * 5/9 : val - 273.15;
        return to === 'Celsius' ? c : to === 'Fahrenheit' ? (c * 9/5) + 32 : c + 273.15;
    }

    handleSearch(query) {
        const list = Object.keys(this.units[this.currentType]).filter(u => u.toLowerCase().includes(query.toLowerCase()));
        const options = list.map(u => `<option value="${u}">${u}</option>`).join('');
        this.fromUnit.innerHTML = options;
        this.toUnit.innerHTML = options;
    }
}

document.addEventListener('DOMContentLoaded', () => new QuantityApp());
