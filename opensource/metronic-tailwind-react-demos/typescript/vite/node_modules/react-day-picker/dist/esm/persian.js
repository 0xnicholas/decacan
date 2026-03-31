import * as dateFnsJalali from "date-fns-jalali";
import React from "react";
import { DateLib, DayPicker as DayPickerComponent, } from "./index.js";
import { enUSJalali } from "./locale/en-US-jalali.js";
import { faIRJalali } from "./locale/fa-IR-jalali.js";
/** Persian (Iran) Jalali locale with DayPicker labels. */
export const faIR = faIRJalali;
/** English (US) Jalali locale with DayPicker labels. */
export const enUS = enUSJalali;
/**
 * Renders the Persian calendar using the DayPicker component.
 *
 * @defaultValue
 * - `locale`: `faIR`
 * - `dir`: `rtl`
 * - `dateLib`: `jalaliDateLib` from `date-fns-jalali`
 * - `numerals`: `arabext` (Eastern Arabic-Indic)
 * @param props - The props for the Persian calendar, including locale, text
 *   direction, date library, and numeral system.
 * @returns The Persian calendar component.
 * @see https://daypicker.dev/docs/localization#persian-calendar
 */
export function DayPicker(props) {
    const dateLib = getDateLib({
        locale: props.locale,
        weekStartsOn: props.broadcastCalendar ? 1 : props.weekStartsOn,
        firstWeekContainsDate: props.firstWeekContainsDate,
        useAdditionalWeekYearTokens: props.useAdditionalWeekYearTokens,
        useAdditionalDayOfYearTokens: props.useAdditionalDayOfYearTokens,
        timeZone: props.timeZone,
    });
    return (React.createElement(DayPickerComponent, { ...props, locale: props.locale ?? faIR, numerals: props.numerals ?? "arabext", dir: props.dir ?? "rtl", dateLib: dateLib }));
}
/**
 * Returns the date library used in the Persian calendar.
 *
 * @param options - Optional configuration for the date library.
 * @returns The date library instance.
 */
export const getDateLib = (options) => {
    return new DateLib(options, dateFnsJalali);
};
