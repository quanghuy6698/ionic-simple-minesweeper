import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { AppConstants } from 'src/app/constants/app.constants';
import { IMineMatrixCell } from 'src/app/models/mine-matrix-cell.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('mineMatrixCanvas') mineMatrixCanvas: ElementRef;
  private context: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private mineMatrix: IMineMatrixCell[][];
  private isFirstTimeOpen: boolean;
  private wantToFlag: boolean;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, private platform: Platform) {
    this.isFirstTimeOpen = true;
    this.wantToFlag = false;
    this.initMineMatrix();
  }

  ngAfterViewInit() {
    this.context = this.mineMatrixCanvas.nativeElement.getContext('2d');
    this.setMineMatrixCanvasSize();
    this.drawCellBorder();
    this.newGame();
  }

  /**
   * Set size of mine matrix
   */
  setMineMatrixCanvasSize() {
    this.platform.ready().then(() => {
      this.canvasWidth = this.platform.width();
      this.canvasHeight = this.platform.height();

      this.context.canvas.width = this.platform.width();
      this.context.canvas.height = this.platform.width();
    });
  }

  /**
   * Init empty mine matrix
   */
  initMineMatrix() {
    // Init matrix
    this.mineMatrix = [];
    // Init rows
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      this.mineMatrix.push([]);
    }
    // Init cols
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      for (let j = 0; j < AppConstants.MATRIX_COL; j++) {
        this.mineMatrix[i].push({
          mineCount: 0,
          isOpen: false,
          isFlag: false,
        });
      }
    }
  }

  /**
   * Clear mine matrix
   */
  clearMineMatrix() {
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      for (let j = 0; j < AppConstants.MATRIX_COL; j++) {
        this.mineMatrix[i][j].mineCount = 0;
        this.mineMatrix[i][j].isFlag = false;
        this.mineMatrix[i][j].isOpen = false;
      }
    }
  }

  /**
   * Draw cell border
   */
  drawCellBorder() {
    this.context.lineWidth = 2;
    this.context.strokeStyle = AppConstants.MATRIX_CELL_BORDER_COLOR;
    const cellWidth = this.canvasWidth / 10;
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      for (let j = 0; j < AppConstants.MATRIX_COL; j++) {
        this.context.strokeRect(cellWidth * i, cellWidth * j, cellWidth, cellWidth);
      }
    }
  }

  /**
   * Generate mines
   */
  generateMines() {
    let mineIndex = 0;
    const totalMine = Math.max(AppConstants.MATRIX_ROW, AppConstants.MATRIX_COL);
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      for (let j = 0; j < AppConstants.MATRIX_COL; j++) {
        let minePossible = Math.floor(Math.random() * 100);
        if (minePossible < 20 && mineIndex < totalMine) {
          this.mineMatrix[i][j].mineCount = -1;
          mineIndex++;
        }
      }
    }
  }

  /**
   * Count mine around a cell
   */
  aroundMineCount() {
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      for (let j = 0; j < AppConstants.MATRIX_COL; j++) {
        if (this.mineMatrix[i][j].mineCount == -1) {
          this.increaseAroundMine(i, j);
        }
      }
    }
  }

  /**
   * Increase mine count around a mine
   *
   * @param x, y coordinate of cell
   */
  increaseAroundMine(x: number, y: number) {
    this.increaseCellMineCount(x - 1, y - 1);
    this.increaseCellMineCount(x, y - 1);
    this.increaseCellMineCount(x + 1, y - 1);
    this.increaseCellMineCount(x - 1, y);
    this.increaseCellMineCount(x + 1, y);
    this.increaseCellMineCount(x - 1, y + 1);
    this.increaseCellMineCount(x, y + 1);
    this.increaseCellMineCount(x + 1, y + 1);
  }

  /**
   * Increase cell mine count
   *
   * @param x, y coordinate of cell
   */
  increaseCellMineCount(x: number, y: number) {
    if (this.isXYIndexInBound(x, y)) {
      if (this.mineMatrix[x][y].mineCount != -1) {
        this.mineMatrix[x][y].mineCount++;
      }
    }
  }

  /**
   * New game
   */
  newGame() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawCellBorder();
    this.clearMineMatrix();
    this.generateMines();
    this.aroundMineCount();
    this.isFirstTimeOpen = true;
    this.wantToFlag = false;
  }

  /**
   * Mine matrix canvas on click
   *
   * @param event
   */
  mineMatrixCanvasOnClick(event: any) {
    const cellWidth = this.canvasWidth / 10;
    const x = Math.floor(event.offsetX / cellWidth);
    const y = Math.floor(event.offsetY / cellWidth);

    this.openCell(x, y);
  }

  /**
   * Check if point is possible
   *
   * @param x, y coordinate of cell
   */
  isXYIndexInBound(x: number, y: number): boolean {
    if (x < AppConstants.MATRIX_ROW && y < AppConstants.MATRIX_COL && x >= 0 && y >= 0) {
      return true;
    }
    return false;
  }

  /**
   * Open a cell
   *
   * @param x, y coordinate of cell
   */
  openCell(x: number, y: number) {
    if (this.isFirstTimeOpen) {
      this.openFirstTime(x, y);
      this.isFirstTimeOpen = false;
    } else {
      if (this.isLose(x, y)) {
        this.showLoseAlert();
        this.newGame();
      } else {
        if (this.isWin()) {
          this.showWinAlert();
          this.newGame();
        } else {
          if (this.wantToFlag) {
            this.flagCell(x, y);
          } else {
            this.drawCellContent(x, y);
          }
        }
      }
    }
  }

  /**
   * Draw a cell content
   *
   * @param x, y coordinate of cell
   */
  drawCellContent(x: number, y: number) {
    this.fillCell(x, y);
    switch (this.mineMatrix[x][y].mineCount) {
      case -1:
        this.drawMine(x, y);
        break;
      case 0:
        break;
      default:
        this.drawMineCount(x, y);
    }
  }

  /**
   * Clear cell
   *
   * @param x, y coordinate of cell
   */
  clearCell(x: number, y: number) {
    const cellWidth = this.canvasWidth / 10;
    this.context.fillStyle = AppConstants.MATRIX_CELL_CLEAR_BG_COLOR;
    this.context.fillRect(cellWidth * x + 2, cellWidth * y + 2, cellWidth - 4, cellWidth - 4);
  }

  /**
   * Fill cell by color
   *
   * @param x, y coordinate of cell
   */
  fillCell(x: number, y: number) {
    const cellWidth = this.canvasWidth / 10;
    this.context.fillStyle = AppConstants.MATRIX_CELL_ACTIVE_BG_COLOR;
    this.context.fillRect(cellWidth * x + 2, cellWidth * y + 2, cellWidth - 4, cellWidth - 4);
  }

  /**
   * Draw mine count of a cell
   *
   * @param x, y coordinate of cell
   */
  drawMineCount(x: number, y: number) {
    const cellWidth = this.canvasWidth / 10;

    this.context.font = AppConstants.MINE_COUNT_FONT;
    switch (this.mineMatrix[x][y].mineCount) {
      case 1:
        this.context.fillStyle = AppConstants.MINE_COUNT_1_COLOR;
        break;
      case 2:
        this.context.fillStyle = AppConstants.MINE_COUNT_2_COLOR;
        break;
      case 3:
        this.context.fillStyle = AppConstants.MINE_COUNT_3_COLOR;
        break;
      case 4:
        this.context.fillStyle = AppConstants.MINE_COUNT_4_COLOR;
        break;
      case 5:
        this.context.fillStyle = AppConstants.MINE_COUNT_5_COLOR;
        break;
      case 6:
        this.context.fillStyle = AppConstants.MINE_COUNT_6_COLOR;
        break;
    }
    this.context.fillText(this.mineMatrix[x][y].mineCount + '', x * cellWidth + cellWidth / 2, y * cellWidth + cellWidth / 2);
  }

  /**
   * Draw if cell is a mine
   *
   * @param x, y coordinate of cell
   */
  drawMine(x: number, y: number) {
    const cellWidth = this.canvasWidth / 10;

    this.context.fillStyle = AppConstants.MINE_COLOR;
    this.context.beginPath();
    this.context.arc(x * cellWidth + cellWidth / 2, y * cellWidth + cellWidth / 2, cellWidth / 4, 0, 2 * Math.PI);
    this.context.fill();
  }

  /**
   * Click flag button
   *
   * @param x, y coordinate of cell
   */
  flag() {
    this.wantToFlag = !this.wantToFlag;
  }

  /**
   * Flag cell
   *
   * @param x, y coordinate of cell
   */
  flagCell(x: number, y: number) {
    if (this.mineMatrix[x][y].isOpen) {
      return;
    }
    if (this.mineMatrix[x][y].isFlag) {
      this.clearCell(x, y);
      this.mineMatrix[x][y].isFlag = false;
    } else {
      this.drawFlag(x, y);
      this.mineMatrix[x][y].isFlag = true;
    }
    this.wantToFlag = false;
  }

  /**
   * Draw flag
   *
   * @param x, y coordinate of cell
   */
  drawFlag(x: number, y: number) {
    const cellWidth = this.canvasWidth / 10;
    this.context.fillStyle = AppConstants.FLAG_COLOR;
    this.context.beginPath();
    this.context.moveTo(x * cellWidth + cellWidth * 0.25, y * cellWidth + cellWidth * 0.2);
    this.context.lineTo(x * cellWidth + cellWidth * 0.75, y * cellWidth + cellWidth * 0.4);
    this.context.lineTo(x * cellWidth + cellWidth * 0.25, y * cellWidth + cellWidth * 0.6);
    this.context.fill();
    //
    this.context.strokeStyle = AppConstants.FLAG_COLOR;
    this.context.beginPath();
    this.context.moveTo(x * cellWidth + cellWidth * 0.2, y * cellWidth + cellWidth * 0.2);
    this.context.lineTo(x * cellWidth + cellWidth * 0.2, y * cellWidth + cellWidth * 0.8);
    this.context.stroke();

    this.flag();
  }

  /**
   * For the first time click on canvas
   *
   * @param x, y coordinate of cell
   */
  openFirstTime(x: number, y: number) {
    if (!this.isXYIndexInBound(x, y) || this.mineMatrix[x][y].isOpen) {
      return;
    }
    this.mineMatrix[x][y].isOpen = true;
    if (this.mineMatrix[x][y].mineCount == 0) {
      this.fillCell(x, y);
      this.openFirstTime(x, y - 1);
      this.openFirstTime(x - 1, y);
      this.openFirstTime(x + 1, y);
      this.openFirstTime(x, y + 1);

      this.isFirstTimeOpen = false;
    } else if (this.mineMatrix[x][y].mineCount != -1) {
      this.fillCell(x, y);
      this.drawMineCount(x, y);
    }
  }

  /**
   * Check lose
   *
   * @param x, y coordinate of cell
   */
  isLose(x: number, y: number): boolean {
    if (this.wantToFlag) {
      return false;
    }
    if (this.mineMatrix[x][y].mineCount == -1 && !this.mineMatrix[x][y].isFlag) {
      return true;
    }
    return false;
  }

  /**
   * Check win
   */
  isWin(): boolean {
    for (let i = 0; i < AppConstants.MATRIX_ROW; i++) {
      for (let j = 0; j < AppConstants.MATRIX_COL; j++) {
        if (!this.mineMatrix[i][j].isOpen) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Show lose alert
   */
  async showLoseAlert() {
    const alert = await this.alertCtrl.create(AppConstants.YOU_LOSE_POPUP);
    await alert.present();
  }

  /**
   * Show win alert
   */
  async showWinAlert() {
    const alert = await this.alertCtrl.create(AppConstants.YOU_WIN_POPUP);
    await alert.present();
  }
}
