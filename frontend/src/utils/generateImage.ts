// 使用 html2canvas 实现高质量图片生成
export class ImageGenerator {
  private static instance: ImageGenerator;

  public static getInstance(): ImageGenerator {
    if (!ImageGenerator.instance) {
      ImageGenerator.instance = new ImageGenerator();
    }
    return ImageGenerator.instance;
  }

  /**
   * 生成吐槽卡图片
   * @param element 要转换的DOM元素
   * @param options 生成选项
   */
  async generateShareCard(
    element: HTMLElement,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      filename?: string;
      text?: string;
      count?: string | number;
      format?: 'png' | 'jpg';
      backgroundColor?: string;
    } = {}
  ): Promise<{ blob: Blob; url: string; filename: string }> {
    // 动态导入 html2canvas
    const { default: html2canvas } = await import('html2canvas');

    const {
      width = 540,
      height = 400,
      quality = 1,
      filename = this.generateFilename(),
      text: customText,
      count,
      format = 'png',
      backgroundColor = '#ffffff'
    } = options;

    const textElement = element.querySelector('.share-text') as HTMLElement | null;
    const resolvedText = customText ?? textElement?.textContent?.trim() ?? '默认文案';
    const resolvedCount = typeof count === 'number' ? count.toString() : (count ?? '0');


    try {
      // 方案1: 直接截图元素
      console.log('使用 html2canvas 生成图片...');

      // 创建一个白色背景的容器
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: ${width}px;
        height: ${height}px;
        z-index: -9999;
        background: ${backgroundColor};
      `;

      // 创建简化版本的HTML结构
      const simplifiedContent = document.createElement('div');
      simplifiedContent.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
        box-sizing: border-box;
        position: relative;
        background: ${backgroundColor};
      `;


      // 创建纯文本内容，避免背景干扰
      simplifiedContent.innerHTML = `
        <div style="
          color: #2d3436;
          font-size: 56px;
          font-weight: bold;
          text-align: center;
          line-height: 1.4;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(255,255,255,0.8), -2px -2px 4px rgba(255,255,255,0.8);
          word-wrap: break-word;
        ">${resolvedText}</div>
        <div style="
          color: #e94560;
          font-size: 24px;
          font-weight: bold;
          position: absolute;
          top: 20px;
          left: 40px;
          text-shadow: 2px 2px 4px rgba(255,255,255,0.9);
        ">NOWORK.CLICK</div>
        <div style="
          color: #ffffff;
          font-size: 22px;
          font-weight: bold;
          background: #e94560;
          padding: 8px 20px;
          border-radius: 20px;
          position: absolute;
          top: 20px;
          right: 40px;
          text-shadow: none;
        ">🔥 怒气高涨</div>
        <div style="
          color: #636e72;
          font-size: 26px;
          font-weight: 600;
          position: absolute;
          bottom: 40px;
          text-shadow: 2px 2px 4px rgba(255,255,255,0.9);
        ">⚡ 团队共鸣 ${resolvedCount} 次</div>
      `;

      container.appendChild(simplifiedContent);
      document.body.appendChild(container);

      // 等待渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用 html2canvas
      const canvas = await html2canvas(simplifiedContent, {
        backgroundColor, // 纯白背景
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width,
        height,
        // 确保样式完整
        onclone: (clonedDoc) => {
          // 设置白色背景
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.background = 'transparent';
            htmlEl.style.backgroundColor = 'transparent';
            htmlEl.style.animation = 'none';
            htmlEl.style.transition = 'none';
          });
          // 设置容器背景为白色
          const container = clonedDoc.querySelector('div') as HTMLElement;
          if (container) {
            container.style.backgroundColor = backgroundColor;
          }
        }
      });

      // 清理
      document.body.removeChild(container);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('生成的画布尺寸为0');
      }

      // 生成Blob
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, mimeType, quality);
      });

      const url = URL.createObjectURL(blob);
      return { blob, url, filename };

    } catch (error) {
      console.error('html2canvas 失败:', error);

      // 备用方案：手动Canvas渲染
      console.log('使用手动Canvas渲染...');
      return await this.manualRender(element, filename, resolvedText, resolvedCount, format, backgroundColor);
    }
  }

  
  /**
   * 手动Canvas渲染（备用方案）- 纯文字透明背景
   */
  private async manualRender(
    element: HTMLElement,
    filename: string,
    text: string,
    count: string,
    format: 'png' | 'jpg',
    backgroundColor: string
  ): Promise<{ blob: Blob; url: string; filename: string }> {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const fallbackText = element.querySelector('.share-text')?.textContent?.trim();
    const finalText = (text ?? '').trim() || fallbackText || '默认文案';
    const finalCount = (count ?? '').trim() || '0';

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawDecorations(ctx);
    this.drawCard(ctx);
    this.drawContent(ctx, finalText, finalCount);

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(new Blob([''], { type: mimeType }));
        }
      }, mimeType, format === 'jpg' ? 0.95 : 1.0);
    });

    const url = URL.createObjectURL(blob);
    return { blob, url, filename };
  }


  /**
   * 绘制装饰性元素
   */
  private drawDecorations(ctx: CanvasRenderingContext2D): void {
    // 左上角装饰
    const gradient1 = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
    gradient1.addColorStop(0, 'rgba(120, 119, 198, 0.2)');
    gradient1.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, 400, 400);

    // 右下角装饰
    const gradient2 = ctx.createRadialGradient(880, 600, 0, 880, 600, 250);
    gradient2.addColorStop(0, 'rgba(233, 69, 96, 0.15)');
    gradient2.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient2;
    ctx.fillRect(630, 350, 450, 450);
  }

  /**
   * 绘制卡片 - 移除背景，保持透明
   */
  private drawCard(_ctx: CanvasRenderingContext2D): void {
    // 不绘制任何背景，保持透明
  }

  /**
   * 绘制内容
   */
  private drawContent(ctx: CanvasRenderingContext2D, text: string, count: string): void {
    // 绘制网站名称 - 添加描边效果
    ctx.font = 'bold 36px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    const siteName = 'NOWORK.CLICK';

    // 先绘制白色描边
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeText(siteName, 180, 200);

    // 再填充文字
    ctx.fillStyle = '#e94560';
    ctx.fillText(siteName, 180, 200);

    // 绘制状态标签
    const statusGradient = ctx.createLinearGradient(780, 180, 960, 180);
    statusGradient.addColorStop(0, '#e94560');
    statusGradient.addColorStop(1, '#ff6b6b');
    ctx.fillStyle = statusGradient;
    this.roundRect(ctx, 780, 160, 180, 60, 30);
    ctx.fill();

    // 状态标签文字
    ctx.font = 'bold 28px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    const statusText = '🔥 怒气高涨';

    // 先绘制白色描边
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeText(statusText, 870, 198);

    // 再填充文字
    ctx.fillStyle = '#ffffff';
    ctx.fillText(statusText, 870, 198);

    // 绘制主文案 - 添加描边效果确保清晰可见
    ctx.font = 'bold 72px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 自动换行处理
    const maxWidth = 700;
    const lineHeight = 100;
    const lines = this.wrapText(ctx, text, maxWidth);

    const startY = 450 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;

      // 先绘制白色描边
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeText(line, 540, y);

      // 再填充黑色文字
      ctx.fillStyle = '#2d3436';
      ctx.fillText(line, 540, y);
    });

    // 不绘制分隔线，保持简洁

    // 绘制底部文字 - 添加描边效果
    ctx.font = '600 40px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const bottomText = `⚡ 团队共鸣 ${count} 次`;

    // 先绘制白色描边
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeText(bottomText, 540, 680);

    // 再填充文字
    ctx.fillStyle = '#636e72';
    ctx.fillText(bottomText, 540, 680);
  }

  /**
   * 文本换行处理
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const chars = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of chars) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : ['文本过长'];
  }

  /**
   * 绘制圆角矩形
   */
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * 生成文件名
   */
  private generateFilename(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    return `nowork-share-${dateStr}-${timeStr}.png`;
  }

  /**
   * 清理资源
   */
  cleanup(url: string): void {
    URL.revokeObjectURL(url);
  }
}
