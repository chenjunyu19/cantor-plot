import * as renderer from './renderer';

type ContorItem = {
    start: number;
    end: number;
};

const AUTO_RENDER_MAX_OBJCOUNT = 100000;

const elForm: HTMLFormElement = document.querySelector('form#input-form')!;
const elInputN: HTMLInputElement = elForm.querySelector('input#arg-n')!;
const elInputRL: HTMLInputElement = elForm.querySelector('input#arg-r-l')!;
const elInputRD: HTMLInputElement = elForm.querySelector('input#arg-r-d')!;
const elInputI: HTMLInputElement = elForm.querySelector('input#arg-i')!;
const elInputAuto: HTMLInputElement = elForm.querySelector('input#opt-auto')!;
const elInputAnimate: HTMLInputElement = elForm.querySelector('input#opt-animate')!;
const elInfo: HTMLParagraphElement = document.querySelector('p#output-info')!;

let autoRender = true;
let animateI = 0;
let intervalId: number;

/**
 * 计算康托尔分形集
 * @param n N 分集
 * @param r 相似比 (0 < r < 0.5)
 */
function cantor(n: number, r: number): ContorItem[] {
    const items: ContorItem[] = [];
    const step = (1 - r) / (n - 1);
    for (let i = 0; i < n; ++i) {
        const start = i * step;
        const end = start + r;
        items.push({ start, end });
    }
    return items;
}

/**
 * 计算康托尔分形集第 i 次迭代后的结果
 * @param n N 分集
 * @param r 相似比 (0 < r < 0.5)
 * @param i 迭代次数
 */
function cantorIteration(n: number, r: number, i: number): ContorItem[] {
    if (i === 0) {
        return [{ start: 0, end: 1 }];
    }
    let items = cantor(n, r);
    while (--i > 0) {
        const newItems: ContorItem[] = [];
        for (const { start: offset } of items) {
            for (let i = 0; i < n; ++i) {
                newItems.push({
                    start: offset + items[i].start * r,
                    end: offset + items[i].end * r,
                });
            }
        }
        items = newItems;
    }
    return items;
}

/**
 * 绘制康托尔分形集
 * @param n N 分集
 * @param r 相似比 (0 < r < 0.5)
 * @param i 迭代次数
 */
function drawCantor(n: number, r: number, i: number) {
    const items = cantorIteration(n, r, i);
    const objcount = items.length ** 3;
    elInfo.textContent = `N = ${n}，r = ${r}，i = ${i}，objcount = ${objcount}。`;
    renderer.setAutoRender(false);
    renderer.initBatchedMesh(objcount);
    const size = items[0].end - items[0].start;
    const offset = -0.5 + size / 2;

    for (let x = 0; x < items.length; ++x) {
        for (let y = 0; y < items.length; ++y) {
            for (let z = 0; z < items.length; ++z) {
                renderer.addCubeToMesh([
                    offset + items[x].start,
                    offset + items[y].start,
                    offset + items[z].start
                ], size);
            }
        }
    }

    renderer.submitMesh();
    if (autoRender) {
        if (objcount > AUTO_RENDER_MAX_OBJCOUNT) {
            elInfo.textContent += '对象数量过大，实时渲染已关闭。';
            window.requestAnimationFrame(renderer.render);
        } else {
            renderer.setAutoRender(true);
        }
    } else {
        window.requestAnimationFrame(renderer.render);
    }
}

window.addEventListener('error', () => window.alert('页面上发生了错误！'));

renderer.init(1280, 720);

elForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearInterval(intervalId);
    animateI = 0;
    const n = parseInt(elInputN.value);
    const r = parseInt(elInputRL.value) / parseInt(elInputRD.value);
    const i = parseInt(elInputI.value);
    autoRender = elInputAuto.checked;
    drawCantor(n, r, i);
    if (elInputAnimate.checked) {
        intervalId = window.setInterval(() => {
            drawCantor(n, r, animateI);
            animateI = (animateI + 1) % (i + 1);
        }, 1000);
    }
});

elForm.dispatchEvent(new Event('submit'));
