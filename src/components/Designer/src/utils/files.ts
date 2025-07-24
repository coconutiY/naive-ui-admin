/**
 * 根据所需类型进行转码并返回下载地址
 * @param type
 * @param filename
 * @param data
 */
export function setEncoded(type: string, filename: string, data: string) {
  const encodedData: string = encodeURIComponent(data);
  return {
    filename: `${filename}.${type.toLowerCase()}`,
    href: `data:application/${
      type === 'svg' ? 'text/xml' : 'bpmn20-xml'
    };charset=UTF-8,${encodedData}`,
    data: data,
  };
}

/**
 * 文件下载方法
 * @param href
 * @param filename
 */
export function downloadFile(href: string, filename: string) {
  if (href && filename) {
    const a: HTMLAnchorElement = document.createElement('a');
    //指定下载的文件名
    a.download = filename;
    //  URL对象
    a.href = href;
    // 模拟点击
    a.click();
    // 释放URL对象
    URL.revokeObjectURL(a.href);
  }
}
