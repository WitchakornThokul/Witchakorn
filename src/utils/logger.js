/**
 * Logger utility for Smart Cow Tracker
 * ซ่อน console.log ในแอพมือถือ production
 */

// ตรวจสอบว่าอยู่ในโหมด development หรือไม่
const isDevelopment = __DEV__;

/**
 * Custom console.log ที่ทำงานเฉพาะในโหมด development
 * @param {...any} args - อาร์กิวเมนต์ที่จะส่งไปยัง console.log
 */
export const log = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Custom console.warn ที่ทำงานเฉพาะในโหมด development
 * @param {...any} args - อาร์กิวเมนต์ที่จะส่งไปยัง console.warn
 */
export const warn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Custom console.error ที่ทำงานเฉพาะในโหมด development
 * @param {...any} args - อาร์กิวเมนต์ที่จะส่งไปยัง console.error
 */
export const error = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

/**
 * Custom console.info ที่ทำงานเฉพาะในโหมด development
 * @param {...any} args - อาร์กิวเมนต์ที่จะส่งไปยัง console.info
 */
export const info = (...args) => {
  if (isDevelopment) {
    console.info(...args);
  }
};

/**
 * Custom console.debug ที่ทำงานเฉพาะในโหมด development
 * @param {...any} args - อาร์กิวเมนต์ที่จะส่งไปยัง console.debug
 */
export const debug = (...args) => {
  if (isDevelopment) {
    console.debug(...args);
  }
};

// Export as default object
export default {
  log,
  warn,
  error,
  info,
  debug,
  isDevelopment
};