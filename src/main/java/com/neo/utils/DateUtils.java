package com.neo.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtils {

    /**
     * Return current system time
     */
    public static String getDataTime(String format) {
        SimpleDateFormat df = new SimpleDateFormat(format);
        return df.format(new Date());
    }

    /**
     * Return current system time
     */
    public static String getDataTimeYMDHMSS() {
        return getDataTime("yyyy-MM-dd HH:mm:ss:sss");
    }

    /**
     * Return current system time
     */
    public static String getDataTimeYMDHMS() {
        return getDataTime("yyyy-MM-dd HH:mm:ss");
    }

    /**
     * Return current system time
     */
    public static String getDataTimeYMD() {
        return getDataTime("yyyy-MM-dd");
    }

    /**
     * Return current system time
     */
    public static String getDataTime() {
        return getDataTime("HH:mm");
    }


}
