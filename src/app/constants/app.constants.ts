export class AppConstants {
  public static readonly MATRIX_ROW = 10;
  public static readonly MATRIX_COL = 10;

  public static readonly FLAG_COLOR = 'red';
  public static readonly MINE_COLOR = 'black';

  public static readonly MATRIX_CELL_ACTIVE_BG_COLOR = 'aquamarine';
  public static readonly MATRIX_CELL_CLEAR_BG_COLOR = 'lightgray';
  public static readonly MATRIX_CELL_BORDER_COLOR = 'black';

  public static readonly MINE_COUNT_FONT = 'bold 20px sans-serif';
  public static readonly MINE_COUNT_1_COLOR = 'black';
  public static readonly MINE_COUNT_2_COLOR = 'green';
  public static readonly MINE_COUNT_3_COLOR = 'orange';
  public static readonly MINE_COUNT_4_COLOR = 'orangered';
  public static readonly MINE_COUNT_5_COLOR = 'deeppink';
  public static readonly MINE_COUNT_6_COLOR = 'red';

  public static readonly YOU_LOSE_POPUP = {
    header: 'You lose!',
    subHeader: 'You just clicked on a mine :)',
    buttons: ['New game'],
  };

  public static readonly YOU_WIN_POPUP = {
    header: 'You Win!',
    subHeader: 'Lucky happy day :)',
    buttons: ['New game'],
  };
}
