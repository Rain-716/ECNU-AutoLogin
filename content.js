// ================= 配置区 =================
const CREDENTIALS = {
    username: "", // 替换为你的学号
    password: ""  // 替换为你的密码
};
// =========================================

// 选择器映射
const SELECTORS = {
    // 账号框有明确 ID: nameInput
    username: "#nameInput", 
    // 密码框没有ID，但 type="password" 在登录页通常是唯一的，且它是 input 标签
    password: "input[type='password']", 
    // 按钮有明确 ID: submitBtn
    button: "#submitBtn"
};

/**
 * 等待元素出现的辅助函数 (适配 Angular 动态渲染)
 * @param {string} selector CSS选择器
 * @param {number} timeout 超时时间(ms)
 * @returns {Promise<Element>}
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver((mutations, obs) => {
            const el = document.querySelector(selector);
            if (el) {
                resolve(el);
                obs.disconnect();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
        }, timeout);
    });
}

/**
 * 模拟框架兼容的输入事件
 * Angular/React 重写了原生 setter，直接赋值 value 往往无效
 */
function simulateInput(element, value) {
    if (!element) return;
    
    // 1. 设置值
    element.value = value;
    
    // 2. 尝试调用原生 setter (针对某些复杂的拦截机制)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (setter) {
        setter.call(element, value);
    }

    // 3. 触发事件通知 Angular 更新 Model
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function runAutoLogin() {
    try {
        console.log("ECNU AutoLogin: 等待页面加载...");

        // 并行等待输入框出现
        const [uInput, pInput] = await Promise.all([
            waitForElement(SELECTORS.username),
            waitForElement(SELECTORS.password)
        ]);

        console.log("ECNU AutoLogin: 检测到输入框，开始填充...");

        // 填充账号密码
        simulateInput(uInput, CREDENTIALS.username);
        simulateInput(pInput, CREDENTIALS.password);

        // 等待一小会儿确保 Angular 校验状态更新 (ng-valid)
        setTimeout(async () => {
            try {
                const btn = await waitForElement(SELECTORS.button);
                console.log("ECNU AutoLogin: 点击登录...");
                btn.click();
            } catch (e) {
                console.error("找不到登录按钮");
            }
        }, 300); // 300ms 延迟

    } catch (error) {
        console.log("自动登录停止:", error.message);
    }
}

// 启动
runAutoLogin();