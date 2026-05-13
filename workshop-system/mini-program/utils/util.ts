/**
 * 格式化日期时间
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  const hour = padZero(d.getHours());
  const min = padZero(d.getMinutes());
  const sec = padZero(d.getSeconds());
  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

/**
 * 补零
 */
function padZero(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

/**
 * 根据当前环节序号和环节序号返回环节状态
 * @param currentStageSeq 当前所在环节序号
 * @param stageSeq 要判断的环节序号
 * @returns 'finish' | 'process' | 'wait'
 */
export function getStageStatus(currentStageSeq: number, stageSeq: number): string {
  if (stageSeq < currentStageSeq) return 'finish';
  if (stageSeq === currentStageSeq) return 'process';
  return 'wait';
}

/**
 * 状态码转文字
 * @param status 0:待生产 1:生产中 2:已完成 3:报废
 */
export function getStatusText(status: number): string {
  const map: Record<number, string> = {
    0: '待生产',
    1: '生产中',
    2: '已完成',
    3: '报废'
  };
  return map[status] || '未知';
}
