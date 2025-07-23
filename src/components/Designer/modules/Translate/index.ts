import zh_CN from '@/lang/zh_CN';
import en_US from '@/lang/en_US';
import { getLanguage } from '@/lang';

const languages: Map<string, any> = new Map();
languages.set('zh_CN', zh_CN);
languages.set('en_US', en_US);
const lang = getLanguage();

/**
 * Translate <BR/>
 * 直接翻译，根据template从翻译文件中获取对应的翻译 <Br/>
 * Replace <BR/>
 * 把template中的 {type}之类的字符串的type值获取出来再次翻译并替换掉{type}
 * @param template 原字符串
 * @param replacements 需要更换的字符串
 */
export const customTranslate = (template: string, replacements?: Record<string, string>) => {
  replacements = replacements || {};
  const translations: any = lang === 'en_US' ? languages.get('en_US') : languages.get('zh_CN');
  // Translate
  template = translations.elements[template] || template;
  // Replace
  return template.replace(/{([^}]+)}/g, (_, key) => {
    if (translations.elements[replacements![key]] === undefined) {
      return replacements![key] || '{' + key + '}';
    }
    return translations.elements[replacements![key]];
  });
};

export default {
  translate: ['value', customTranslate],
};
