import React, { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MonthEntry { rev: number; orders: number; sessions: number; }
interface StateEntry { state: string; rev: number; orders: number; }
interface StateMonthEntry { rev: number; orders: number; }
interface CampaignRow {
  id: string;
  name: string;
  src: string;
  total: MonthEntry;
  months: Record<string, MonthEntry>;
  byState: StateEntry[];
  byStateMonth: Record<string, Record<string, StateMonthEntry>>;
}
interface StateRow {
  name: string;
  abbr: string;
  rev: number;
  orders: number;
  ticket: number;
  months: Record<string, { rev: number; orders: number }>;
}

// ─── Dados estáticos (GA4 · Meta Ads · Jan–Abr 2026) ─────────────────────────

const MONTH_TOTALS: Record<string, MonthEntry & { label: string }> = {
  '202601': { label: 'Janeiro',   rev: 236045, orders: 665,  sessions: 73594  },
  '202602': { label: 'Fevereiro', rev: 225092, orders: 693,  sessions: 71128  },
  '202603': { label: 'Março',     rev: 345774, orders: 1106, sessions: 106826 },
  '202604': { label: 'Abril',     rev: 240089, orders: 726,  sessions: 77835  },
};

const CAMPAIGNS: CampaignRow[] = [
  {
    id: '120216037685880533', name: 'Essence VD · Você Está Sendo Enganado',
    src: 'meta / cpc',
    total: { rev: 209925, orders: 630, sessions: 62178 },
    months: {
      '202601': { rev: 50991,  orders: 143, sessions: 14589 },
      '202602': { rev: 51150,  orders: 168, sessions: 15307 },
      '202603': { rev: 65899,  orders: 205, sessions: 18809 },
      '202604': { rev: 41884,  orders: 114, sessions: 13473 },
    },
    byState: [
      { state:'SP', rev:75592, orders:246 }, { state:'MG', rev:14418, orders:44  },
      { state:'RJ', rev:13893, orders:46  }, { state:'RS', rev:11008, orders:42  },
      { state:'BA', rev:9251,  orders:26  }, { state:'PR', rev:9154,  orders:33  },
      { state:'SC', rev:9027,  orders:31  }, { state:'PE', rev:8752,  orders:18  },
      { state:'CE', rev:8228,  orders:17  }, { state:'DF', rev:7718,  orders:16  },
      { state:'ES', rev:7359,  orders:22  }, { state:'AM', rev:6508,  orders:9   },
      { state:'GO', rev:5504,  orders:19  }, { state:'PA', rev:4423,  orders:9   },
      { state:'PB', rev:4210,  orders:11  }, { state:'MS', rev:3494,  orders:9   },
      { state:'AL', rev:2132,  orders:5   }, { state:'RN', rev:2122,  orders:5   },
      { state:'PI', rev:1778,  orders:3   }, { state:'MT', rev:1316,  orders:5   },
      { state:'SE', rev:1301,  orders:5   }, { state:'TO', rev:806,   orders:2   },
      { state:'MA', rev:580,   orders:1   }, { state:'RR', rev:378,   orders:2   },
      { state:'AP', rev:190,   orders:1   }, { state:'AC', rev:190,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:21648.53,orders:62}, '202602':{rev:18574.88,orders:62}, '202603':{rev:20339.07,orders:76}, '202604':{rev:15106.68,orders:47} },
      'MG': { '202601':{rev:3112.8,orders:11},   '202602':{rev:7353.98,orders:24},  '202603':{rev:3391.9,orders:8},   '202604':{rev:559.8,orders:1}    },
      'RJ': { '202601':{rev:6408.73,orders:19},  '202602':{rev:5429.15,orders:20},  '202603':{rev:1497.23,orders:5},  '202604':{rev:558.34,orders:2}   },
      'RS': { '202601':{rev:1572.25,orders:5},   '202602':{rev:2047.13,orders:8},   '202603':{rev:4778.72,orders:19}, '202604':{rev:2609.94,orders:10}  },
      'BA': { '202601':{rev:1887.12,orders:5},   '202602':{rev:2124.02,orders:7},   '202603':{rev:2342.77,orders:7},  '202604':{rev:2897.02,orders:7}   },
      'SC': { '202601':{rev:1463.62,orders:5},   '202602':{rev:1228.04,orders:4},   '202603':{rev:3633.0,orders:12},  '202604':{rev:2895.85,orders:11}  },
      'PR': { '202601':{rev:1952.19,orders:8},   '202602':{rev:1497.58,orders:7},   '202603':{rev:4342.16,orders:13}, '202604':{rev:1361.89,orders:5}   },
      'PE': { '202601':{rev:484.62,orders:2},    '202602':{rev:2464.19,orders:5},   '202603':{rev:1717.34,orders:5},  '202604':{rev:4085.6,orders:6}    },
      'CE': { '202601':{rev:193.91,orders:1},    '202602':{rev:1168.93,orders:4},   '202603':{rev:3994.88,orders:8},  '202604':{rev:2870.46,orders:4}   },
      'DF': { '202601':{rev:4484.19,orders:4},   '202602':{rev:1346.75,orders:5},   '202603':{rev:1887.04,orders:7},  '202604':{rev:184.22,orders:1}    },
      'ES': { '202601':{rev:892.78,orders:4},    '202602':{rev:1386.45,orders:4},   '202603':{rev:3152.59,orders:9},  '202604':{rev:1927.66,orders:5}   },
      'AM': { '202601':{rev:1039.5,orders:2},    '202602':{rev:2030.6,orders:1},    '202603':{rev:1827.85,orders:2},  '202604':{rev:1610.36,orders:4}   },
      'GO': { '202601':{rev:569.7,orders:2},     '202602':{rev:393.81,orders:2},    '202603':{rev:2967.8,orders:11},  '202604':{rev:1572.2,orders:4}    },
      'PA': { '202601':{rev:189.91,orders:1},    '202602':{rev:640.91,orders:2},    '202603':{rev:2501.51,orders:4},  '202604':{rev:1090.43,orders:2}   },
      'PB': { '202601':{rev:971.52,orders:3},    '202602':{rev:1219.01,orders:4},   '202603':{rev:2019.32,orders:4},  '202604':{rev:0,orders:0}         },
      'MS': { '202601':{rev:0,orders:0},         '202602':{rev:1253.23,orders:4},   '202603':{rev:1840.62,orders:4},  '202604':{rev:779.62,orders:2}    },
      'AL': { '202601':{rev:1354.48,orders:2},   '202602':{rev:193.91,orders:1},    '202603':{rev:399.8,orders:1},    '202604':{rev:184.22,orders:1}    },
      'RN': { '202601':{rev:799.6,orders:2},     '202602':{rev:0,orders:0},         '202603':{rev:1122.34,orders:2},  '202604':{rev:199.9,orders:1}     },
      'PI': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:398.82,orders:1},   '202604':{rev:1379.34,orders:2}   },
      'MT': { '202601':{rev:706.3,orders:2},     '202602':{rev:419.8,orders:2},     '202603':{rev:0,orders:0},        '202604':{rev:189.91,orders:1}    },
      'SE': { '202601':{rev:279.9,orders:1},     '202602':{rev:0,orders:0},         '202603':{rev:364.62,orders:2},   '202604':{rev:656.19,orders:2}    },
      'TO': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:806.03,orders:2},   '202604':{rev:0,orders:0}         },
      'MA': { '202601':{rev:579.8,orders:1},     '202602':{rev:0,orders:0},         '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}         },
      'RR': { '202601':{rev:0,orders:0},         '202602':{rev:184.22,orders:1},    '202603':{rev:193.91,orders:1},   '202604':{rev:0,orders:0}         },
      'AP': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:189.91,orders:1},   '202604':{rev:0,orders:0}         },
      'AC': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:189.91,orders:1},   '202604':{rev:0,orders:0}         },
    },
  },
  {
    id: '120237824657680533', name: 'LAL Jogo Wave · Est. Branca',
    src: 'meta / cpc',
    total: { rev: 106632, orders: 319, sessions: 17389 },
    months: {
      '202601': { rev: 39636,  orders: 113, sessions: 6590 },
      '202602': { rev: 24253,  orders: 74,  sessions: 4102 },
      '202603': { rev: 24079,  orders: 72,  sessions: 4145 },
      '202604': { rev: 18663,  orders: 60,  sessions: 2552 },
    },
    byState: [
      { state:'SP', rev:29050, orders:93  }, { state:'RJ', rev:12797, orders:39  },
      { state:'MG', rev:11052, orders:32  }, { state:'SC', rev:7729,  orders:23  },
      { state:'BA', rev:6896,  orders:16  }, { state:'RS', rev:5988,  orders:20  },
      { state:'PE', rev:5484,  orders:15  }, { state:'PR', rev:5442,  orders:17  },
      { state:'GO', rev:3980,  orders:10  }, { state:'DF', rev:3011,  orders:11  },
      { state:'MA', rev:2451,  orders:5   }, { state:'ES', rev:2304,  orders:7   },
      { state:'MT', rev:1870,  orders:6   }, { state:'CE', rev:1800,  orders:4   },
      { state:'RO', rev:1220,  orders:3   }, { state:'PA', rev:1060,  orders:3   },
      { state:'AM', rev:868,   orders:3   }, { state:'PI', rev:809,   orders:2   },
      { state:'TO', rev:534,   orders:2   }, { state:'PB', rev:410,   orders:1   },
      { state:'SE', rev:409,   orders:2   }, { state:'RN', rev:400,   orders:2   },
      { state:'MS', rev:220,   orders:1   }, { state:'AC', rev:209,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:10223.15,orders:31}, '202602':{rev:7072.33,orders:22}, '202603':{rev:5847.4,orders:22},  '202604':{rev:5906.64,orders:18} },
      'RJ': { '202601':{rev:5451.26,orders:15},  '202602':{rev:2779.21,orders:9},  '202603':{rev:1700.6,orders:6},   '202604':{rev:2865.93,orders:9}  },
      'MG': { '202601':{rev:4969.88,orders:12},  '202602':{rev:2962.72,orders:10}, '202603':{rev:2075.56,orders:6},  '202604':{rev:1043.58,orders:4}  },
      'SC': { '202601':{rev:2497.28,orders:8},   '202602':{rev:950.98,orders:4},   '202603':{rev:3101.94,orders:7},  '202604':{rev:1390.39,orders:5}  },
      'BA': { '202601':{rev:1925.92,orders:5},   '202602':{rev:1438.43,orders:3},  '202603':{rev:2832.02,orders:6},  '202604':{rev:699.83,orders:2}   },
      'RS': { '202601':{rev:2234.41,orders:7},   '202602':{rev:1820.92,orders:3},  '202603':{rev:795.78,orders:4},   '202604':{rev:1136.92,orders:6}  },
      'PE': { '202601':{rev:1662.55,orders:6},   '202602':{rev:1148.51,orders:3},  '202603':{rev:1943.33,orders:4},  '202604':{rev:729.5,orders:2}    },
      'PR': { '202601':{rev:1902.41,orders:6},   '202602':{rev:755.89,orders:3},   '202603':{rev:1758.34,orders:4},  '202604':{rev:1025.55,orders:4}  },
      'GO': { '202601':{rev:694.04,orders:2},    '202602':{rev:635.52,orders:2},   '202603':{rev:1359.5,orders:4},   '202604':{rev:1291.14,orders:2}  },
      'DF': { '202601':{rev:1312.81,orders:4},   '202602':{rev:422.55,orders:2},   '202603':{rev:609.22,orders:3},   '202604':{rev:666.53,orders:2}   },
      'MA': { '202601':{rev:1419.4,orders:2},    '202602':{rev:208.91,orders:1},   '202603':{rev:398.82,orders:1},   '202604':{rev:423.72,orders:1}   },
      'ES': { '202601':{rev:1465.13,orders:4},   '202602':{rev:398.82,orders:1},   '202603':{rev:219.9,orders:1},    '202604':{rev:219.9,orders:1}    },
      'MT': { '202601':{rev:1027.73,orders:2},   '202602':{rev:842.58,orders:4},   '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'CE': { '202601':{rev:199.9,orders:1},     '202602':{rev:833.82,orders:1},   '202603':{rev:219.9,orders:1},    '202604':{rev:545.98,orders:1}   },
      'RO': { '202601':{rev:202.65,orders:1},    '202602':{rev:219.9,orders:1},    '202603':{rev:797.64,orders:1},   '202604':{rev:0,orders:0}        },
      'PA': { '202601':{rev:439.8,orders:1},     '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:620.18,orders:2}   },
      'AM': { '202601':{rev:699.7,orders:2},     '202602':{rev:168.6,orders:1},    '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'PI': { '202601':{rev:588.73,orders:1},    '202602':{rev:0,orders:0},        '202603':{rev:219.9,orders:1},    '202604':{rev:0,orders:0}        },
      'TO': { '202601':{rev:0,orders:0},         '202602':{rev:334.8,orders:1},    '202603':{rev:199.41,orders:1},   '202604':{rev:0,orders:0}        },
      'PB': { '202601':{rev:0,orders:0},         '202602':{rev:409.8,orders:1},    '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'SE': { '202601':{rev:199.9,orders:1},     '202602':{rev:208.91,orders:1},   '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'RN': { '202601':{rev:299.9,orders:1},     '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:100.44,orders:1}   },
      'MS': { '202601':{rev:219.9,orders:1},     '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'AC': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:208.91,orders:1}   },
    },
  },
  {
    id: '120233362899670533', name: 'Catálogo DPA 01 · Remarketing',
    src: 'meta / cpc',
    total: { rev: 105824, orders: 361, sessions: 28342 },
    months: {
      '202601': { rev: 20303,  orders: 63,  sessions: 3098  },
      '202602': { rev: 21864,  orders: 72,  sessions: 4508  },
      '202603': { rev: 30657,  orders: 116, sessions: 10314 },
      '202604': { rev: 33000,  orders: 110, sessions: 10422 },
    },
    byState: [
      { state:'SP', rev:34997, orders:124 }, { state:'RJ', rev:22281, orders:73  },
      { state:'MG', rev:12065, orders:42  }, { state:'BA', rev:5065,  orders:14  },
      { state:'PE', rev:5035,  orders:16  }, { state:'RS', rev:3812,  orders:17  },
      { state:'ES', rev:3765,  orders:11  }, { state:'SC', rev:3193,  orders:9   },
      { state:'DF', rev:3157,  orders:11  }, { state:'CE', rev:2130,  orders:9   },
      { state:'PR', rev:1725,  orders:6   }, { state:'AL', rev:1515,  orders:4   },
      { state:'GO', rev:1481,  orders:4   }, { state:'MS', rev:974,   orders:3   },
      { state:'MT', rev:753,   orders:3   }, { state:'TO', rev:700,   orders:1   },
      { state:'MA', rev:655,   orders:3   }, { state:'RN', rev:598,   orders:2   },
      { state:'PI', rev:595,   orders:2   }, { state:'PA', rev:412,   orders:2   },
      { state:'SE', rev:337,   orders:2   }, { state:'PB', rev:200,   orders:1   },
      { state:'AM', rev:180,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:6990.67,orders:24},  '202602':{rev:9253.24,orders:31},  '202603':{rev:10504.31,orders:39}, '202604':{rev:8585.35,orders:31} },
      'RJ': { '202601':{rev:3134.16,orders:11},  '202602':{rev:3956.02,orders:13},  '202603':{rev:6512.51,orders:25},  '202604':{rev:8678.17,orders:24} },
      'MG': { '202601':{rev:2573.15,orders:8},   '202602':{rev:1883.9,orders:4},    '202603':{rev:3739.95,orders:16},  '202604':{rev:4050.87,orders:15} },
      'BA': { '202601':{rev:1576.04,orders:4},   '202602':{rev:599.7,orders:2},     '202603':{rev:389.81,orders:2},    '202604':{rev:2499.25,orders:6}  },
      'PE': { '202601':{rev:1022.51,orders:4},   '202602':{rev:1204.01,orders:4},   '202603':{rev:1597.11,orders:5},   '202604':{rev:1211.02,orders:3}  },
      'RS': { '202601':{rev:1276.02,orders:4},   '202602':{rev:698.87,orders:4},    '202603':{rev:761.07,orders:3},    '202604':{rev:1657.25,orders:7}  },
      'ES': { '202601':{rev:199.9,orders:1},     '202602':{rev:559.8,orders:2},     '202603':{rev:977.82,orders:3},    '202604':{rev:2027.81,orders:5}  },
      'DF': { '202601':{rev:417.55,orders:1},    '202602':{rev:794.93,orders:3},    '202603':{rev:773.38,orders:4},    '202604':{rev:1419.7,orders:4}   },
      'SC': { '202601':{rev:1823.28,orders:2},   '202602':{rev:393.81,orders:2},    '202603':{rev:602.04,orders:3},    '202604':{rev:374.13,orders:2}   },
      'CE': { '202601':{rev:114.9,orders:1},     '202602':{rev:581.72,orders:2},    '202603':{rev:842.71,orders:3},    '202604':{rev:590.33,orders:3}   },
      'PR': { '202601':{rev:0,orders:0},         '202602':{rev:269.7,orders:1},     '202603':{rev:522.91,orders:2},    '202604':{rev:932.82,orders:3}   },
      'AL': { '202601':{rev:895.02,orders:2},    '202602':{rev:399.8,orders:1},     '202603':{rev:219.9,orders:1},     '202604':{rev:0,orders:0}        },
      'GO': { '202601':{rev:279.9,orders:1},     '202602':{rev:655.23,orders:1},    '202603':{rev:545.81,orders:2},    '202604':{rev:0,orders:0}        },
      'MS': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:779.62,orders:2},    '202604':{rev:193.91,orders:1}   },
      'MT': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:0,orders:0},         '202604':{rev:753.15,orders:3}   },
      'TO': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:699.7,orders:1},     '202604':{rev:0,orders:0}        },
      'MA': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:189.9,orders:1},     '202604':{rev:465.42,orders:2}   },
      'RN': { '202601':{rev:0,orders:0},         '202602':{rev:394.6,orders:1},     '202603':{rev:203.61,orders:1},    '202604':{rev:0,orders:0}        },
      'PI': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:594.7,orders:2},     '202604':{rev:0,orders:0}        },
      'PA': { '202601':{rev:0,orders:0},         '202602':{rev:218.41,orders:1},    '202603':{rev:0,orders:0},         '202604':{rev:193.91,orders:1}   },
      'SE': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:0,orders:0},         '202604':{rev:337.16,orders:2}   },
      'PB': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:199.9,orders:1},     '202604':{rev:0,orders:0}        },
      'AM': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:0,orders:0},         '202604':{rev:179.8,orders:1}    },
    },
  },
  {
    id: '120209904601020533', name: 'Wave VD · 63 Centavos',
    src: 'meta / cpc',
    total: { rev: 94184, orders: 281, sessions: 27547 },
    months: {
      '202601': { rev: 24798,  orders: 71,  sessions: 7868  },
      '202602': { rev: 26752,  orders: 84,  sessions: 7775  },
      '202603': { rev: 24141,  orders: 77,  sessions: 7658  },
      '202604': { rev: 18493,  orders: 49,  sessions: 4246  },
    },
    byState: [
      { state:'SP', rev:36133, orders:109 }, { state:'MG', rev:10361, orders:33  },
      { state:'RJ', rev:7155,  orders:25  }, { state:'SC', rev:6114,  orders:17  },
      { state:'BA', rev:5156,  orders:11  }, { state:'DF', rev:4876,  orders:11  },
      { state:'RS', rev:4610,  orders:15  }, { state:'PR', rev:3777,  orders:12  },
      { state:'GO', rev:3434,  orders:10  }, { state:'PE', rev:3419,  orders:9   },
      { state:'ES', rev:1962,  orders:6   }, { state:'SE', rev:1399,  orders:2   },
      { state:'PA', rev:1212,  orders:4   }, { state:'MT', rev:1045,  orders:5   },
      { state:'PB', rev:942,   orders:3   }, { state:'CE', rev:584,   orders:2   },
      { state:'RR', rev:530,   orders:1   }, { state:'AM', rev:418,   orders:1   },
      { state:'RN', rev:384,   orders:2   }, { state:'MA', rev:280,   orders:1   },
      { state:'AL', rev:200,   orders:1   }, { state:'PI', rev:194,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:9892.74,orders:32},  '202602':{rev:10831.31,orders:32}, '202603':{rev:9614.32,orders:29},  '202604':{rev:5794.14,orders:16} },
      'MG': { '202601':{rev:3010.92,orders:10},  '202602':{rev:2790.0,orders:10},   '202603':{rev:2475.92,orders:9},   '202604':{rev:2084.26,orders:4}  },
      'RJ': { '202601':{rev:1854.01,orders:6},   '202602':{rev:2201.76,orders:9},   '202603':{rev:1739.88,orders:7},   '202604':{rev:1359.31,orders:3}  },
      'SC': { '202601':{rev:1023.51,orders:4},   '202602':{rev:2557.74,orders:6},   '202603':{rev:1298.49,orders:4},   '202604':{rev:1234.56,orders:3}  },
      'BA': { '202601':{rev:2153.01,orders:3},   '202602':{rev:1131.67,orders:3},   '202603':{rev:974.41,orders:3},    '202604':{rev:897.04,orders:2}   },
      'DF': { '202601':{rev:1819.2,orders:2},    '202602':{rev:1495.07,orders:4},   '202603':{rev:1134.88,orders:4},   '202604':{rev:426.61,orders:1}   },
      'RS': { '202601':{rev:708.71,orders:3},    '202602':{rev:1472.05,orders:6},   '202603':{rev:1516.75,orders:3},   '202604':{rev:912.35,orders:3}   },
      'PR': { '202601':{rev:426.61,orders:1},    '202602':{rev:517.44,orders:2},    '202603':{rev:1530.87,orders:4},   '202604':{rev:1302.05,orders:5}  },
      'GO': { '202601':{rev:284.91,orders:1},    '202602':{rev:479.22,orders:2},    '202603':{rev:628.71,orders:2},    '202604':{rev:2040.84,orders:5}  },
      'PE': { '202601':{rev:1387.16,orders:3},   '202602':{rev:0,orders:0},         '202603':{rev:950.52,orders:3},    '202604':{rev:1081.46,orders:3}  },
      'ES': { '202601':{rev:819.6,orders:2},     '202602':{rev:648.71,orders:2},    '202603':{rev:493.21,orders:2},    '202604':{rev:0,orders:0}        },
      'SE': { '202601':{rev:601.11,orders:1},    '202602':{rev:797.64,orders:1},    '202603':{rev:0,orders:0},         '202604':{rev:0,orders:0}        },
      'PA': { '202601':{rev:616.12,orders:2},    '202602':{rev:271.51,orders:1},    '202603':{rev:0,orders:0},         '202604':{rev:324.76,orders:1}   },
      'MT': { '202601':{rev:199.9,orders:1},     '202602':{rev:213.31,orders:1},    '202603':{rev:413.51,orders:2},    '202604':{rev:218.41,orders:1}   },
      'PB': { '202601':{rev:0,orders:0},         '202602':{rev:426.62,orders:2},    '202603':{rev:515.7,orders:1},     '202604':{rev:0,orders:0}        },
      'CE': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:184.21,orders:1},    '202604':{rev:399.8,orders:1}    },
      'RR': { '202601':{rev:0,orders:0},         '202602':{rev:529.8,orders:1},     '202603':{rev:0,orders:0},         '202604':{rev:0,orders:0}        },
      'AM': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:0,orders:0},         '202604':{rev:417.82,orders:1}   },
      'RN': { '202601':{rev:0,orders:0},         '202602':{rev:193.91,orders:1},    '202603':{rev:189.91,orders:1},    '202604':{rev:0,orders:0}        },
      'MA': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:279.9,orders:1},     '202604':{rev:0,orders:0}        },
      'AL': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},         '202603':{rev:199.9,orders:1},     '202604':{rev:0,orders:0}        },
      'PI': { '202601':{rev:0,orders:0},         '202602':{rev:193.91,orders:1},    '202603':{rev:0,orders:0},         '202604':{rev:0,orders:0}        },
    },
  },
  {
    id: '120237822074150533', name: 'LAL Kit Wave · Est. Degradê',
    src: 'meta / cpc',
    total: { rev: 75886, orders: 198, sessions: 9521 },
    months: {
      '202601': { rev: 27837,  orders: 72,  sessions: 3419 },
      '202602': { rev: 38110,  orders: 98,  sessions: 4953 },
      '202603': { rev: 9939,   orders: 28,  sessions: 1136 },
      '202604': { rev: 0,      orders: 0,   sessions: 13   },
    },
    byState: [
      { state:'RJ', rev:18765, orders:43  }, { state:'SP', rev:16009, orders:42  },
      { state:'MG', rev:5656,  orders:18  }, { state:'GO', rev:5355,  orders:13  },
      { state:'RS', rev:4790,  orders:15  }, { state:'PE', rev:4004,  orders:8   },
      { state:'BA', rev:2852,  orders:8   }, { state:'PR', rev:2697,  orders:7   },
      { state:'DF', rev:2547,  orders:6   }, { state:'MT', rev:2512,  orders:6   },
      { state:'SC', rev:1873,  orders:7   }, { state:'CE', rev:1766,  orders:5   },
      { state:'ES', rev:1738,  orders:3   }, { state:'AM', rev:1714,  orders:5   },
      { state:'MS', rev:842,   orders:3   }, { state:'RN', rev:600,   orders:2   },
      { state:'PA', rev:567,   orders:2   }, { state:'SE', rev:400,   orders:1   },
      { state:'PB', rev:300,   orders:1   }, { state:'AL', rev:300,   orders:1   },
      { state:'RO', rev:300,   orders:1   }, { state:'RR', rev:300,   orders:1   },
    ],
    byStateMonth: {
      'RJ': { '202601':{rev:7274.57,orders:14}, '202602':{rev:10216.26,orders:25}, '202603':{rev:1274.65,orders:4},  '202604':{rev:0,orders:0} },
      'SP': { '202601':{rev:6789.06,orders:20}, '202602':{rev:8935.1,orders:21},  '202603':{rev:284.91,orders:1},   '202604':{rev:0,orders:0} },
      'MG': { '202601':{rev:869.72,orders:3},   '202602':{rev:2853.91,orders:9},  '202603':{rev:1932.23,orders:6},  '202604':{rev:0,orders:0} },
      'GO': { '202601':{rev:1958.35,orders:5},  '202602':{rev:2520.58,orders:5},  '202603':{rev:875.72,orders:3},   '202604':{rev:0,orders:0} },
      'RS': { '202601':{rev:1059.94,orders:2},  '202602':{rev:2827.45,orders:11}, '202603':{rev:902.29,orders:2},   '202604':{rev:0,orders:0} },
      'PE': { '202601':{rev:739.4,orders:2},    '202602':{rev:1924.06,orders:4},  '202603':{rev:1340.35,orders:2},  '202604':{rev:0,orders:0} },
      'BA': { '202601':{rev:2001.32,orders:5},  '202602':{rev:850.61,orders:3},   '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'PR': { '202601':{rev:1094.75,orders:4},  '202602':{rev:1602.12,orders:3},  '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'DF': { '202601':{rev:229.9,orders:1},    '202602':{rev:2098.3,orders:4},   '202603':{rev:218.41,orders:1},   '202604':{rev:0,orders:0} },
      'MT': { '202601':{rev:1377.12,orders:4},  '202602':{rev:0,orders:0},        '202603':{rev:1134.5,orders:2},   '202604':{rev:0,orders:0} },
      'SC': { '202601':{rev:554.7,orders:2},    '202602':{rev:994.2,orders:3},    '202603':{rev:324.57,orders:2},   '202604':{rev:0,orders:0} },
      'CE': { '202601':{rev:575.82,orders:2},   '202602':{rev:590.81,orders:2},   '202603':{rev:599.8,orders:1},    '202604':{rev:0,orders:0} },
      'ES': { '202601':{rev:1738.4,orders:3},   '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'AM': { '202601':{rev:574.71,orders:2},   '202602':{rev:554.3,orders:1},    '202603':{rev:584.81,orders:2},   '202604':{rev:0,orders:0} },
      'MS': { '202601':{rev:0,orders:0},         '202602':{rev:651.64,orders:2},   '202603':{rev:189.91,orders:1},   '202604':{rev:0,orders:0} },
      'RN': { '202601':{rev:0,orders:0},         '202602':{rev:599.8,orders:2},    '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'PA': { '202601':{rev:0,orders:0},         '202602':{rev:290.91,orders:1},   '202603':{rev:276.37,orders:1},   '202604':{rev:0,orders:0} },
      'SE': { '202601':{rev:399.8,orders:1},    '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'PB': { '202601':{rev:299.9,orders:1},    '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'AL': { '202601':{rev:299.9,orders:1},    '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'RO': { '202601':{rev:0,orders:0},         '202602':{rev:299.9,orders:1},    '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
      'RR': { '202601':{rev:0,orders:0},         '202602':{rev:299.9,orders:1},    '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0} },
    },
  },
  {
    id: '120236241962090533', name: 'RMKT Toalha Azul · Multi-formato',
    src: 'meta / cpc',
    total: { rev: 71874, orders: 228, sessions: 10494 },
    months: {
      '202601': { rev: 25011,  orders: 79,  sessions: 3285 },
      '202602': { rev: 19337,  orders: 59,  sessions: 2646 },
      '202603': { rev: 15006,  orders: 51,  sessions: 2581 },
      '202604': { rev: 12520,  orders: 39,  sessions: 1982 },
    },
    byState: [
      { state:'SP', rev:22537, orders:75  }, { state:'RJ', rev:12862, orders:43  },
      { state:'MG', rev:6936,  orders:20  }, { state:'RS', rev:4556,  orders:13  },
      { state:'BA', rev:3914,  orders:15  }, { state:'PR', rev:3396,  orders:10  },
      { state:'SC', rev:2905,  orders:7   }, { state:'PE', rev:2886,  orders:7   },
      { state:'DF', rev:2049,  orders:6   }, { state:'GO', rev:1842,  orders:6   },
      { state:'ES', rev:1797,  orders:5   }, { state:'CE', rev:1693,  orders:5   },
      { state:'MA', rev:1359,  orders:5   }, { state:'RN', rev:895,   orders:2   },
      { state:'PA', rev:727,   orders:2   }, { state:'AL', rev:479,   orders:2   },
      { state:'SE', rev:230,   orders:1   }, { state:'AM', rev:230,   orders:1   },
      { state:'RO', rev:194,   orders:1   }, { state:'MT', rev:175,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:7894.54,orders:27}, '202602':{rev:6141.61,orders:19}, '202603':{rev:3173.13,orders:13}, '202604':{rev:5327.42,orders:16} },
      'RJ': { '202601':{rev:3691.71,orders:14}, '202602':{rev:3186.25,orders:9},  '202603':{rev:3128.13,orders:11}, '202604':{rev:2856.13,orders:9}  },
      'MG': { '202601':{rev:1811.13,orders:5},  '202602':{rev:1637.12,orders:6},  '202603':{rev:1380.44,orders:4},  '202604':{rev:2106.92,orders:5}  },
      'RS': { '202601':{rev:1276.32,orders:4},  '202602':{rev:334.81,orders:1},   '202603':{rev:2741.98,orders:7},  '202604':{rev:202.65,orders:1}   },
      'BA': { '202601':{rev:1269.2,orders:4},   '202602':{rev:1121.54,orders:4},  '202603':{rev:927.57,orders:4},   '202604':{rev:595.68,orders:3}   },
      'PR': { '202601':{rev:702.46,orders:1},   '202602':{rev:2101.73,orders:6},  '202603':{rev:591.7,orders:3},    '202604':{rev:0,orders:0}        },
      'SC': { '202601':{rev:1120.51,orders:3},  '202602':{rev:854.55,orders:2},   '202603':{rev:664.19,orders:1},   '202604':{rev:265.73,orders:1}   },
      'PE': { '202601':{rev:1944.52,orders:4},  '202602':{rev:941.17,orders:3},   '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'DF': { '202601':{rev:657.74,orders:2},   '202602':{rev:612.15,orders:2},   '202603':{rev:779.61,orders:2},   '202604':{rev:0,orders:0}        },
      'GO': { '202601':{rev:818.51,orders:2},   '202602':{rev:431.72,orders:2},   '202603':{rev:0,orders:0},        '202604':{rev:591.68,orders:2}   },
      'ES': { '202601':{rev:1132.91,orders:3},  '202602':{rev:289.39,orders:1},   '202603':{rev:375.07,orders:1},   '202604':{rev:0,orders:0}        },
      'CE': { '202601':{rev:284.91,orders:1},   '202602':{rev:639.7,orders:1},    '202603':{rev:768.88,orders:3},   '202604':{rev:0,orders:0}        },
      'MA': { '202601':{rev:829.7,orders:3},    '202602':{rev:229.9,orders:1},    '202603':{rev:299.9,orders:1},    '202604':{rev:0,orders:0}        },
      'RN': { '202601':{rev:0,orders:0},         '202602':{rev:515.26,orders:1},   '202603':{rev:0,orders:0},        '202604':{rev:379.82,orders:1}   },
      'PA': { '202601':{rev:426.61,orders:1},   '202602':{rev:299.9,orders:1},    '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'AL': { '202601':{rev:284.91,orders:1},   '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:193.91,orders:1}   },
      'SE': { '202601':{rev:229.9,orders:1},    '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'AM': { '202601':{rev:229.9,orders:1},    '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'RO': { '202601':{rev:193.91,orders:1},   '202602':{rev:0,orders:0},        '202603':{rev:0,orders:0},        '202604':{rev:0,orders:0}        },
      'MT': { '202601':{rev:0,orders:0},         '202602':{rev:0,orders:0},        '202603':{rev:175.0,orders:1},    '202604':{rev:0,orders:0}        },
    },
  },
  {
    id: 'WG_CONVERSÃO_KIT_WAVE', name: 'WG Conversão · Kit Wave',
    src: 'facebook / paid_social',
    total: { rev: 60732, orders: 184, sessions: 9286 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 40721,  orders: 125, sessions: 5970 },
      '202604': { rev: 20011,  orders: 59,  sessions: 3316 },
    },
    byState: [
      { state:'SP', rev:19087, orders:59  }, { state:'RJ', rev:5380,  orders:19  },
      { state:'BA', rev:4543,  orders:11  }, { state:'CE', rev:4330,  orders:11  },
      { state:'PR', rev:3789,  orders:13  }, { state:'MG', rev:3561,  orders:10  },
      { state:'PE', rev:3529,  orders:11  }, { state:'MT', rev:2556,  orders:4   },
      { state:'RS', rev:2353,  orders:9   }, { state:'DF', rev:2120,  orders:7   },
      { state:'GO', rev:2103,  orders:6   }, { state:'SC', rev:1622,  orders:5   },
      { state:'MS', rev:1031,  orders:4   }, { state:'PA', rev:1030,  orders:3   },
      { state:'MA', rev:855,   orders:2   }, { state:'RN', rev:801,   orders:3   },
      { state:'RO', rev:560,   orders:1   }, { state:'ES', rev:399,   orders:2   },
      { state:'PB', rev:304,   orders:1   }, { state:'AM', rev:291,   orders:1   },
      { state:'SE', rev:280,   orders:1   }, { state:'AP', rev:209,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:10810.46,orders:37}, '202604':{rev:8276.09,orders:22} },
      'RJ': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:5379.56,orders:19},  '202604':{rev:0,orders:0}        },
      'BA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2865.8,orders:7},    '202604':{rev:1677.33,orders:4}  },
      'CE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:3151.24,orders:8},   '202604':{rev:1179.0,orders:3}   },
      'PR': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2533.5,orders:8},    '202604':{rev:1255.76,orders:5}  },
      'MG': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:3560.5,orders:10},   '202604':{rev:0,orders:0}        },
      'PE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2027.26,orders:6},   '202604':{rev:1501.91,orders:5}  },
      'MT': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2095.3,orders:3},    '202604':{rev:460.58,orders:1}   },
      'RS': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1562.06,orders:5},   '202604':{rev:791.05,orders:4}   },
      'DF': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1002.26,orders:3},   '202604':{rev:1117.65,orders:4}  },
      'GO': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1486.24,orders:4},   '202604':{rev:616.72,orders:2}   },
      'SC': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:598.23,orders:2},    '202604':{rev:1175.83,orders:4}  },
      'MS': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:751.38,orders:3},    '202604':{rev:279.9,orders:1}    },
      'PA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:276.37,orders:1},    '202604':{rev:753.95,orders:2}   },
      'MA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:265.91,orders:1},    '202604':{rev:588.73,orders:1}   },
      'RN': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:801.37,orders:3},    '202604':{rev:0,orders:0}        },
      'RO': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:560.23,orders:1},    '202604':{rev:0,orders:0}        },
      'ES': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:398.82,orders:2},    '202604':{rev:0,orders:0}        },
      'PB': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:303.66,orders:1},    '202604':{rev:0,orders:0}        },
      'AM': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:290.91,orders:1},    '202604':{rev:0,orders:0}        },
      'SE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:279.9,orders:1}    },
      'AP': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:208.91,orders:1}   },
    },
  },
  {
    id: '120240276217390533', name: 'Essence VD · Enganado (Variante B)',
    src: 'meta / cpc',
    total: { rev: 56621, orders: 188, sessions: 17531 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0     },
      '202602': { rev: 0,      orders: 0,   sessions: 0     },
      '202603': { rev: 34705,  orders: 114, sessions: 10329 },
      '202604': { rev: 21916,  orders: 74,  sessions: 7202  },
    },
    byState: [
      { state:'RJ', rev:25559, orders:87  }, { state:'SP', rev:12792, orders:47  },
      { state:'MG', rev:4962,  orders:16  }, { state:'ES', rev:3027,  orders:8   },
      { state:'RS', rev:2406,  orders:4   }, { state:'BA', rev:2296,  orders:5   },
      { state:'PR', rev:976,   orders:5   }, { state:'MT', rev:792,   orders:3   },
      { state:'PA', rev:668,   orders:2   }, { state:'MA', rev:581,   orders:3   },
      { state:'DF', rev:560,   orders:1   }, { state:'GO', rev:515,   orders:1   },
      { state:'CE', rev:400,   orders:1   }, { state:'PE', rev:384,   orders:2   },
      { state:'PI', rev:315,   orders:1   }, { state:'PB', rev:194,   orders:1   },
      { state:'SC', rev:194,   orders:1   },
    ],
    byStateMonth: {
      'RJ': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:15281.87,orders:50}, '202604':{rev:10277.57,orders:37} },
      'SP': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:9458.75,orders:35},  '202604':{rev:3333.2,orders:12}   },
      'MG': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2019.81,orders:7},   '202604':{rev:2942.22,orders:9}   },
      'ES': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1555.55,orders:5},   '202604':{rev:1471.87,orders:3}   },
      'RS': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2126.31,orders:3},   '202604':{rev:279.9,orders:1}     },
      'BA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1423.64,orders:3},   '202604':{rev:872.8,orders:2}     },
      'PR': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:549.9,orders:3},     '202604':{rev:425.71,orders:2}    },
      'MT': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:180.41,orders:1},    '202604':{rev:611.73,orders:2}    },
      'PA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:114.9,orders:1},     '202604':{rev:552.64,orders:1}    },
      'MA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:409.8,orders:2},     '202604':{rev:170.82,orders:1}    },
      'DF': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:560.23,orders:1},    '202604':{rev:0,orders:0}         },
      'GO': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:514.7,orders:1},     '202604':{rev:0,orders:0}         },
      'CE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:399.8,orders:1}     },
      'PE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:193.91,orders:1},    '202604':{rev:189.91,orders:1}    },
      'PI': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:314.8,orders:1},     '202604':{rev:0,orders:0}         },
      'PB': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:193.91,orders:1}    },
      'SC': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:193.91,orders:1}    },
    },
  },
  {
    id: 'WG_CONVERSÃO_ANO_NOVO', name: 'WG Conversão · Ano Novo',
    src: 'facebook / paid_social',
    total: { rev: 53874, orders: 176, sessions: 11182 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0    },
      '202602': { rev: 0,      orders: 0,   sessions: 0    },
      '202603': { rev: 29407,  orders: 103, sessions: 5747 },
      '202604': { rev: 24466,  orders: 73,  sessions: 5435 },
    },
    byState: [
      { state:'SP', rev:19156, orders:67  }, { state:'MG', rev:7379,  orders:19  },
      { state:'RJ', rev:4572,  orders:18  }, { state:'RS', rev:3834,  orders:11  },
      { state:'DF', rev:2396,  orders:7   }, { state:'BA', rev:2305,  orders:8   },
      { state:'SC', rev:2269,  orders:7   }, { state:'PE', rev:1952,  orders:6   },
      { state:'ES', rev:1835,  orders:7   }, { state:'PR', rev:1687,  orders:6   },
      { state:'PB', rev:1538,  orders:3   }, { state:'GO', rev:1036,  orders:5   },
      { state:'CE', rev:933,   orders:4   }, { state:'MA', rev:929,   orders:3   },
      { state:'SE', rev:798,   orders:1   }, { state:'RO', rev:393,   orders:1   },
      { state:'PA', rev:266,   orders:1   }, { state:'MT', rev:218,   orders:1   },
    ],
    byStateMonth: {
      'SP': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:10912.83,orders:41}, '202604':{rev:8242.95,orders:26} },
      'MG': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:4255.54,orders:10},  '202604':{rev:3122.99,orders:9}  },
      'RJ': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2408.74,orders:10},  '202604':{rev:2162.85,orders:8}  },
      'RS': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1953.38,orders:7},   '202604':{rev:1880.8,orders:4}   },
      'SC': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:918.81,orders:3},    '202604':{rev:1786.97,orders:5}  },
      'BA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:655.27,orders:3},    '202604':{rev:1929.86,orders:6}  },
      'DF': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1888.14,orders:6},   '202604':{rev:507.53,orders:1}   },
      'PE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1002.46,orders:4},   '202604':{rev:949.55,orders:2}   },
      'ES': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1210.3,orders:4},    '202604':{rev:624.46,orders:3}   },
      'PR': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:760.55,orders:4},    '202604':{rev:926.26,orders:2}   },
      'PB': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:189.9,orders:1},     '202604':{rev:1347.94,orders:2}  },
      'GO': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:661.47,orders:3},    '202604':{rev:558.35,orders:3}   },
      'CE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:743.27,orders:3},    '202604':{rev:189.91,orders:1}   },
      'MA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:276.37,orders:1},    '202604':{rev:652.58,orders:2}   },
      'SE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:797.64,orders:1},    '202604':{rev:0,orders:0}        },
      'RO': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:392.86,orders:1},    '202604':{rev:0,orders:0}        },
      'PA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:265.91,orders:1}   },
      'MT': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:218.41,orders:1}   },
    },
  },
  {
    id: '120240276183270533', name: 'Essence VD · Enganado (Variante C)',
    src: 'meta / cpc',
    total: { rev: 51239, orders: 151, sessions: 14701 },
    months: {
      '202601': { rev: 0,      orders: 0,   sessions: 0     },
      '202602': { rev: 0,      orders: 0,   sessions: 0     },
      '202603': { rev: 37381,  orders: 110, sessions: 10805 },
      '202604': { rev: 13859,  orders: 41,  sessions: 3896  },
    },
    byState: [
      { state:'MG', rev:20902, orders:63  }, { state:'SP', rev:12890, orders:42  },
      { state:'BA', rev:5380,  orders:6   }, { state:'RJ', rev:5250,  orders:17  },
      { state:'GO', rev:1356,  orders:5   }, { state:'ES', rev:860,   orders:3   },
      { state:'PB', rev:810,   orders:2   }, { state:'RS', rev:784,   orders:2   },
      { state:'AM', rev:698,   orders:2   }, { state:'DF', rev:600,   orders:2   },
      { state:'CE', rev:570,   orders:1   }, { state:'MT', rev:489,   orders:2   },
      { state:'PR', rev:268,   orders:2   }, { state:'PE', rev:200,   orders:1   },
      { state:'SC', rev:184,   orders:1   },
    ],
    byStateMonth: {
      'MG': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:15600.04,orders:44}, '202604':{rev:5501.52,orders:20} },
      'SP': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:9543.9,orders:31},   '202604':{rev:4340.63,orders:12} },
      'BA': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:2611.15,orders:4},   '202604':{rev:2768.54,orders:2}  },
      'RJ': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:4403.84,orders:13},  '202604':{rev:845.75,orders:4}   },
      'GO': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:1166.0,orders:4},    '202604':{rev:189.91,orders:1}   },
      'ES': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:859.79,orders:3},    '202604':{rev:0,orders:0}        },
      'PB': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:295.66,orders:1},    '202604':{rev:514.7,orders:1}    },
      'RS': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:599.7,orders:1},     '202604':{rev:184.22,orders:1}   },
      'AM': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:189.91,orders:1},    '202604':{rev:507.98,orders:1}   },
      'DF': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:599.7,orders:2},     '202604':{rev:0,orders:0}        },
      'CE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:569.73,orders:1},    '202604':{rev:0,orders:0}        },
      'MT': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:489.47,orders:2},    '202604':{rev:0,orders:0}        },
      'PR': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:267.55,orders:2},    '202604':{rev:0,orders:0}        },
      'PE': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:0,orders:0},         '202604':{rev:199.9,orders:1}    },
      'SC': { '202601':{rev:0,orders:0}, '202602':{rev:0,orders:0}, '202603':{rev:184.21,orders:1},    '202604':{rev:0,orders:0}        },
    },
  },
];

const STATES: StateRow[] = [
  { name: 'São Paulo',           abbr: 'SP', rev: 328165, orders: 1072, ticket: 306, months: { '202601':{rev:77720,orders:243}, '202602':{rev:79193,orders:242}, '202603':{rev:99019,orders:357}, '202604':{rev:75095,orders:236} } },
  { name: 'Rio de Janeiro',      abbr: 'RJ', rev: 153314, orders: 479,  ticket: 320, months: { '202601':{rev:33133,orders:92},  '202602':{rev:34709,orders:106}, '202603':{rev:49199,orders:168}, '202604':{rev:36273,orders:113} } },
  { name: 'Minas Gerais',        abbr: 'MG', rev: 118593, orders: 356,  ticket: 333, months: { '202601':{rev:22390,orders:62},  '202602':{rev:22939,orders:76},  '202603':{rev:46629,orders:135}, '202604':{rev:27017,orders:85}  } },
  { name: 'Bahia',               abbr: 'BA', rev: 56442,  orders: 142,  ticket: 397, months: { '202601':{rev:15033,orders:35},  '202602':{rev:8106,orders:26},   '202603':{rev:16139,orders:42},  '202604':{rev:17444,orders:40}  } },
  { name: 'Rio Grande do Sul',   abbr: 'RS', rev: 51854,  orders: 174,  ticket: 298, months: { '202601':{rev:9838,orders:31},   '202602':{rev:10180,orders:38},  '202603':{rev:21189,orders:63},  '202604':{rev:11229,orders:43}  } },
  { name: 'Pernambuco',          abbr: 'PE', rev: 42776,  orders: 112,  ticket: 382, months: { '202601':{rev:9282,orders:27},   '202602':{rev:10568,orders:26},  '202603':{rev:11847,orders:32},  '202604':{rev:11079,orders:27}  } },
  { name: 'Paraná',              abbr: 'PR', rev: 38609,  orders: 128,  ticket: 302, months: { '202601':{rev:7236,orders:24},   '202602':{rev:7577,orders:25},   '202603':{rev:14905,orders:51},  '202604':{rev:8891,orders:28}   } },
  { name: 'Santa Catarina',      abbr: 'SC', rev: 38293,  orders: 121,  ticket: 316, months: { '202601':{rev:9594,orders:26},   '202602':{rev:7806,orders:26},   '202603':{rev:12371,orders:40},  '202604':{rev:9711,orders:34}   } },
  { name: 'Distrito Federal',    abbr: 'DF', rev: 32467,  orders: 89,   ticket: 365, months: { '202601':{rev:9416,orders:16},   '202602':{rev:7764,orders:24},   '202603':{rev:9909,orders:35},   '202604':{rev:5811,orders:16}   } },
  { name: 'Goiás',               abbr: 'GO', rev: 31159,  orders: 92,   ticket: 339, months: { '202601':{rev:7229,orders:20},   '202602':{rev:5609,orders:16},   '202603':{rev:10959,orders:36},  '202604':{rev:7547,orders:21}   } },
  { name: 'Espírito Santo',      abbr: 'ES', rev: 28241,  orders: 84,   ticket: 336, months: { '202601':{rev:8584,orders:23},   '202602':{rev:3473,orders:11},   '202603':{rev:9523,orders:31},   '202604':{rev:6662,orders:19}   } },
  { name: 'Ceará',               abbr: 'CE', rev: 25901,  orders: 67,   ticket: 387, months: { '202601':{rev:2355,orders:9},    '202602':{rev:3999,orders:11},   '202603':{rev:12754,orders:31},  '202604':{rev:6793,orders:16}   } },
  { name: 'Mato Grosso',         abbr: 'MT', rev: 17885,  orders: 48,   ticket: 373, months: { '202601':{rev:5870,orders:11},   '202602':{rev:3619,orders:13},   '202603':{rev:4488,orders:11},   '202604':{rev:3908,orders:13}   } },
  { name: 'Pará',                abbr: 'PA', rev: 12393,  orders: 34,   ticket: 364, months: { '202601':{rev:1972,orders:6},    '202602':{rev:2321,orders:7},    '202603':{rev:3369,orders:8},    '202604':{rev:4730,orders:13}   } },
  { name: 'Amazonas',            abbr: 'AM', rev: 11120,  orders: 24,   ticket: 463, months: { '202601':{rev:2544,orders:7},    '202602':{rev:2967,orders:4},    '202603':{rev:2893,orders:6},    '202604':{rev:2716,orders:7}    } },
  { name: 'Maranhão',            abbr: 'MA', rev: 10476,  orders: 29,   ticket: 361, months: { '202601':{rev:2829,orders:6},    '202602':{rev:2225,orders:6},    '202603':{rev:2665,orders:9},    '202604':{rev:2756,orders:8}    } },
  { name: 'Paraíba',             abbr: 'PB', rev: 10258,  orders: 28,   ticket: 366, months: { '202601':{rev:1271,orders:4},    '202602':{rev:2317,orders:8},    '202603':{rev:3744,orders:10},   '202604':{rev:2925,orders:6}    } },
  { name: 'Mato Grosso do Sul',  abbr: 'MS', rev: 7650,   orders: 22,   ticket: 348, months: { '202601':{rev:511,orders:2},     '202602':{rev:2704,orders:7},    '202603':{rev:3562,orders:10},   '202604':{rev:1253,orders:4}    } },
  { name: 'Rio Grande do Norte', abbr: 'RN', rev: 5800,   orders: 18,   ticket: 322, months: { '202601':{rev:1100,orders:3},    '202602':{rev:1704,orders:5},    '202603':{rev:2317,orders:7},    '202604':{rev:680,orders:3}     } },
  { name: 'Alagoas',             abbr: 'AL', rev: 5721,   orders: 15,   ticket: 381, months: { '202601':{rev:3511,orders:7},    '202602':{rev:1012,orders:3},    '202603':{rev:820,orders:3},     '202604':{rev:378,orders:2}     } },
  { name: 'Sergipe',             abbr: 'SE', rev: 5337,   orders: 16,   ticket: 334, months: { '202601':{rev:1711,orders:5},    '202602':{rev:1191,orders:3},    '202603':{rev:1162,orders:3},    '202604':{rev:1273,orders:5}    } },
  { name: 'Piauí',               abbr: 'PI', rev: 3874,   orders: 10,   ticket: 387, months: { '202601':{rev:589,orders:1},     '202602':{rev:194,orders:1},     '202603':{rev:1712,orders:6},    '202604':{rev:1379,orders:2}    } },
  { name: 'Rondônia',            abbr: 'RO', rev: 2880,   orders: 8,    ticket: 360, months: { '202601':{rev:397,orders:2},     '202602':{rev:733,orders:3},     '202603':{rev:1751,orders:3},    '202604':{rev:0,orders:0}       } },
  { name: 'Tocantins',           abbr: 'TO', rev: 2252,   orders: 6,    ticket: 375, months: { '202601':{rev:0,orders:0},       '202602':{rev:335,orders:1},     '202603':{rev:1705,orders:4},    '202604':{rev:212,orders:1}     } },
  { name: 'Roraima',             abbr: 'RR', rev: 1208,   orders: 4,    ticket: 302, months: { '202601':{rev:0,orders:0},       '202602':{rev:1014,orders:3},    '202603':{rev:194,orders:1},     '202604':{rev:0,orders:0}       } },
  { name: 'Acre',                abbr: 'AC', rev: 589,    orders: 3,    ticket: 196, months: { '202601':{rev:0,orders:0},       '202602':{rev:0,orders:0},       '202603':{rev:380,orders:2},     '202604':{rev:209,orders:1}     } },
  { name: 'Amapá',               abbr: 'AP', rev: 399,    orders: 2,    ticket: 199, months: { '202601':{rev:0,orders:0},       '202602':{rev:0,orders:0},       '202603':{rev:190,orders:1},     '202604':{rev:209,orders:1}     } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtR = (v: number) =>
  v >= 1_000_000 ? `R$${(v/1_000_000).toFixed(2)}M`
  : v >= 1_000   ? `R$${(v/1_000).toFixed(1)}k`
  : `R$${v.toFixed(0)}`;

const fmtFull = (v: number) =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MONTHS_ORDER = ['202601','202602','202603','202604'];

// ─── Componente Principal ─────────────────────────────────────────────────────

interface Props { clientName: string; theme: 'light' | 'dark'; }

const GeoAnalysisPage: React.FC<Props> = ({ theme }) => {
  const [activePeriod, setActivePeriod] = useState<'geral'|'202601'|'202602'|'202603'|'202604'>('geral');
  const [activeTab, setActiveTab] = useState<'estados'|'campanhas'>('campanhas');
  const [expandedCamp, setExpandedCamp] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Totais do período selecionado
  const periodTotal: MonthEntry = activePeriod === 'geral'
    ? Object.values(MONTH_TOTALS).reduce((acc, m) => ({ rev: acc.rev + m.rev, orders: acc.orders + m.orders, sessions: acc.sessions + m.sessions }), { rev: 0, orders: 0, sessions: 0 })
    : MONTH_TOTALS[activePeriod];

  const totalTicket = periodTotal.orders > 0 ? Math.round(periodTotal.rev / periodTotal.orders) : 0;

  // Campanhas filtradas pelo período
  const filteredCampaigns = CAMPAIGNS.map(c => {
    const data: MonthEntry = activePeriod === 'geral'
      ? c.total
      : (c.months[activePeriod] || { rev: 0, orders: 0, sessions: 0 });
    return { ...c, data };
  }).filter(c => c.data.orders > 0).sort((a, b) => b.data.rev - a.data.rev);

  // Estados filtrados pelo período
  const filteredStates = STATES
    .map(s => {
      const rev    = activePeriod === 'geral' ? s.rev    : (s.months[activePeriod]?.rev    ?? 0);
      const orders = activePeriod === 'geral' ? s.orders : (s.months[activePeriod]?.orders ?? 0);
      const ticket = orders > 0 ? Math.round(rev / orders) : 0;
      return { ...s, rev, orders, ticket };
    })
    .filter(s => s.rev > 0)
    .sort((a, b) => b.rev - a.rev);

  const statesTotalRev = filteredStates.reduce((acc, s) => acc + s.rev, 0);
  const statesPeriodLabel = activePeriod === 'geral'
    ? 'Jan–Abr 2026'
    : MONTH_TOTALS[activePeriod].label + ' 2026';

  const bg = isDark ? '#1a1a2e' : '#f8fafc';
  const card = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2f4a' : '#e2e8f0';
  const text = isDark ? '#e2e8f0' : '#0f172a';
  const muted = isDark ? '#64748b' : '#94a3b8';

  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2027 100%)',
        padding: '40px 48px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decoração */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(59,130,246,0.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(16,185,129,0.08)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ background:'rgba(59,130,246,0.2)', border:'1px solid rgba(59,130,246,0.4)', color:'#93c5fd', fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', padding:'4px 12px', borderRadius:100 }}>
              Meta Ads · 2026
            </span>
            <span style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7', fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 12px', borderRadius:100 }}>
              GA4 · casadatoalha.com.br
            </span>
          </div>
          <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', margin:'0 0 4px', letterSpacing:'-0.5px' }}>
            Análise Geográfica & Campanhas
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:0 }}>
            Receita e pedidos atribuídos ao Meta Ads · Jan → Abr 2026
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px' }}>

        {/* ── FILTRO DE PERÍODO ── */}
        <div style={{ display:'flex', gap:8, marginTop:28, marginBottom:24, flexWrap:'wrap' }}>
          {([['geral','Geral 2026'],['202601','Janeiro'],['202602','Fevereiro'],['202603','Março'],['202604','Abril¹']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActivePeriod(key as any)}
              style={{
                padding:'9px 20px', borderRadius:100, cursor:'pointer', fontSize:12, fontWeight:700,
                background: activePeriod === key ? '#2563eb' : card,
                color: activePeriod === key ? '#fff' : muted,
                boxShadow: activePeriod === key ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
                border: activePeriod === key ? '1px solid transparent' : `1px solid ${border}`,
                transition:'all .2s',
              }}>
              {label}
            </button>
          ))}
          {activePeriod === '202604' && (
            <span style={{ alignSelf:'center', fontSize:10, color:muted, fontStyle:'italic' }}>¹ Até 27/04/2026</span>
          )}
        </div>

        {/* ── KPI CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Receita Meta',    value: fmtFull(periodTotal.rev),    sub:'Total atribuído', color:'#10b981', icon:'💰' },
            { label:'Pedidos',         value: periodTotal.orders.toLocaleString('pt-BR'), sub:'Transações GA4', color:'#3b82f6', icon:'🛒' },
            { label:'Ticket Médio',    value:`R$ ${totalTicket.toLocaleString('pt-BR')}`,  sub:'Receita ÷ Pedidos',  color:'#f59e0b', icon:'🎯' },
            { label:'Sessões Meta',    value: periodTotal.sessions.toLocaleString('pt-BR'), sub:'Visitas atribuídas', color:'#8b5cf6', icon:'📱' },
          ].map(k => (
            <div key={k.label} style={{ background:card, border:`1px solid ${border}`, borderRadius:20, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${k.color},${k.color}99)` }} />
              <div style={{ fontSize:22, marginBottom:6 }}>{k.icon}</div>
              <div style={{ fontSize:22, fontWeight:900, color:text, letterSpacing:'-0.5px', marginBottom:2 }}>{k.value}</div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:muted }}>{k.label}</div>
              <div style={{ fontSize:10, color:muted, marginTop:2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── AVISO DE METODOLOGIA ── */}
        <div style={{
          background: isDark ? '#1a1f35' : '#f8faff',
          border: `1px solid ${isDark ? '#2a3555' : '#dbeafe'}`,
          borderRadius: 14, padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
          <p style={{ fontSize: 11, color: isDark ? '#93c5fd' : '#1e40af', margin: 0, lineHeight: 1.6 }}>
            <strong>Metodologia:</strong> dados filtrados por{' '}
            <code style={{ background: isDark ? '#1e3a5f' : '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>
              Origem/mídia da sessão contém "meta"
            </code>{' '}
            ou{' '}
            <code style={{ background: isDark ? '#1e3a5f' : '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>
              "facebook"
            </code>
            . Receita por estado via dimensão{' '}
            <code style={{ background: isDark ? '#1e3a5f' : '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>region</code>{' '}
            do GA4.
          </p>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:2, background: isDark ? '#0f172a' : '#f1f5f9', padding:4, borderRadius:16, marginBottom:24, width:'fit-content' }}>
          {([['campanhas','📢 Campanhas'],['estados','📍 Estados']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                padding:'10px 24px', borderRadius:12, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                background: activeTab === key ? card : 'transparent',
                color: activeTab === key ? text : muted,
                boxShadow: activeTab === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition:'all .2s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ABA: CAMPANHAS ── */}
        {activeTab === 'campanhas' && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, overflow:'hidden' }}>
            {/* cabeçalho */}
            <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:900, color:text }}>Top Campanhas Meta Ads</div>
                <div style={{ fontSize:11, color:muted, marginTop:2 }}>
                  {activePeriod === 'geral' ? 'Janeiro a Abril 2026' : MONTH_TOTALS[activePeriod].label + ' 2026'} · Ordenado por receita atribuída (GA4)
                </div>
              </div>
              <span style={{ background:'#eff6ff', color:'#2563eb', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 14px', borderRadius:100 }}>
                {filteredCampaigns.length} campanhas ativas
              </span>
            </div>

            {/* header tabela */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 90px 90px 90px 28px', gap:12, padding:'10px 24px', borderBottom:`1px solid ${border}` }}>
              {['Campanha','Evolução Mensal','Receita','Pedidos','Ticket',''].map(h => (
                <div key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:muted, textAlign: h !== 'Campanha' && h !== 'Evolução Mensal' ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* linhas */}
            {filteredCampaigns.map((c, idx) => {
              const ticket = c.data.orders > 0 ? Math.round(c.data.rev / c.data.orders) : 0;
              const maxMonthRev = Math.max(...MONTHS_ORDER.map(m => c.months[m]?.rev || 0));
              const isExpanded = expandedCamp === c.id;
              const stateRows = activePeriod === 'geral'
                ? c.byState.map(s => ({ state: s.state, rev: s.rev, orders: s.orders }))
                : Object.entries(c.byStateMonth ?? {})
                    .map(([st, months]) => ({ state: st, rev: months[activePeriod]?.rev ?? 0, orders: months[activePeriod]?.orders ?? 0 }))
                    .filter(s => s.rev > 0)
                    .sort((a, b) => b.rev - a.rev);
              if (activePeriod === 'geral') stateRows.sort((a, b) => b.rev - a.rev);
              const maxSRev = stateRows[0]?.rev || 1;
              const statePeriodLabel = activePeriod === 'geral' ? 'Jan–Abr 2026' : MONTH_TOTALS[activePeriod].label + ' 2026';
              return (
                <div key={c.id} style={{ borderBottom: idx < filteredCampaigns.length-1 ? `1px solid ${border}` : 'none' }}>
                  {/* linha principal — clicável */}
                  <div
                    onClick={() => setExpandedCamp(isExpanded ? null : c.id)}
                    style={{
                      display:'grid', gridTemplateColumns:'2fr 1fr 90px 90px 90px 28px', gap:12,
                      padding:'14px 24px', cursor:'pointer',
                      background: isExpanded ? (isDark ? 'rgba(37,99,235,0.08)' : '#f0f7ff') : 'transparent',
                      transition:'background .15s',
                    }}>
                    {/* nome */}
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10, fontWeight:900, color:muted, width:18 }}>{idx+1}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:text, lineHeight:1.3 }}>{c.name}</div>
                        <div style={{ fontSize:10, color:muted, marginTop:2, fontFamily:'monospace' }}>
                          {c.id} · {c.src}
                        </div>
                      </div>
                    </div>
                    {/* sparkline */}
                    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:32 }}>
                      {MONTHS_ORDER.map(m => {
                        const val = c.months[m]?.rev || 0;
                        const pct = maxMonthRev > 0 ? val / maxMonthRev : 0;
                        const isActive = m === activePeriod;
                        return (
                          <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                            <div style={{
                              width:'100%', height: Math.max(pct * 24, val > 0 ? 4 : 0),
                              background: isActive ? '#2563eb' : (val > 0 ? '#bfdbfe' : (isDark?'#1e2a3a':'#e2e8f0')),
                              borderRadius:2, transition:'height .3s',
                            }} />
                            <div style={{ fontSize:8, color: isActive ? '#2563eb' : muted, fontWeight: isActive ? 800 : 400 }}>
                              {['J','F','M','A'][MONTHS_ORDER.indexOf(m)]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* métricas */}
                    <div style={{ fontSize:13, fontWeight:800, color:text, textAlign:'right' }}>{fmtFull(c.data.rev)}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#2563eb', textAlign:'right' }}>{c.data.orders}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#10b981', textAlign:'right' }}>R$ {ticket.toLocaleString('pt-BR')}</div>
                    {/* chevron */}
                    <div style={{ fontSize:12, color:muted, textAlign:'center', alignSelf:'center', transform: isExpanded ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▾</div>
                  </div>

                  {/* painel de estados expandível */}
                  {isExpanded && (
                    <div style={{
                      background: isDark ? 'rgba(37,99,235,0.05)' : '#f8fbff',
                      borderTop: `1px dashed ${isDark ? '#2a3a6a' : '#bfdbfe'}`,
                      padding: '16px 24px 20px 52px',
                    }}>
                      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'#2563eb', marginBottom:12 }}>
                        📍 Receita por Estado · {statePeriodLabel}
                      </div>
                      {stateRows.length === 0 ? (
                        <div style={{ fontSize:12, color:muted }}>Sem dados para este período.</div>
                      ) : (
                        <div style={{ border:`1px solid ${isDark?'#1e2a4a':'#dbeafe'}`, borderRadius:12, overflow:'hidden' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'28px 60px 1fr 160px 70px 90px', gap:12, padding:'8px 16px', background: isDark?'#0f172a':'#eff6ff', borderBottom:`1px solid ${isDark?'#1e2a4a':'#dbeafe'}` }}>
                            {['#','Estado','Participação','Receita','Pedidos','Ticket'].map((h, hi) => (
                              <div key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#2563eb', textAlign: hi >= 3 ? 'right' : 'left' }}>{h}</div>
                            ))}
                          </div>
                          {stateRows.map((s, si) => {
                            const sPct = (s.rev / maxSRev) * 100;
                            const sTicket = s.orders > 0 ? s.rev / s.orders : 0;
                            return (
                              <div key={s.state} style={{
                                display:'grid', gridTemplateColumns:'28px 60px 1fr 160px 70px 90px', gap:12, alignItems:'center',
                                padding:'9px 16px',
                                borderBottom: si < stateRows.length-1 ? `1px solid ${isDark?'#1a2240':'#e8f0fe'}` : 'none',
                                background: si === 0 ? (isDark?'rgba(251,191,36,0.04)':'#fffdf0') : 'transparent',
                              }}>
                                <div style={{ fontSize:10, fontWeight:700, color:muted, textAlign:'center' }}>{si+1}</div>
                                <div style={{ fontSize:12, fontWeight:700, color:text }}>{s.state}</div>
                                <div style={{ height:6, background: isDark?'#1e2a3a':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
                                  <div style={{ width:`${sPct}%`, height:'100%', background:'#3b82f6', borderRadius:100 }} />
                                </div>
                                <div style={{ fontSize:12, fontWeight:800, color:text, textAlign:'right', fontFamily:'monospace' }}>
                                  R$ {s.rev.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                                </div>
                                <div style={{ fontSize:12, fontWeight:600, color:'#2563eb', textAlign:'right' }}>{s.orders}</div>
                                <div style={{ fontSize:12, fontWeight:700, color:'#10b981', textAlign:'right' }}>
                                  R$ {sTicket.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCampaigns.length === 0 && (
              <div style={{ padding:48, textAlign:'center', color:muted, fontSize:13 }}>
                Nenhuma campanha ativa neste período.
              </div>
            )}
          </div>
        )}

        {/* ── ABA: ESTADOS ── */}
        {activeTab === 'estados' && (
          <div>
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, overflow:'hidden' }}>
              <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:900, color:text }}>Receita por Estado · Meta Ads</div>
                  <div style={{ fontSize:11, color:muted, marginTop:2 }}>{statesPeriodLabel} · {filteredStates.length} estados com receita atribuída</div>
                </div>
                <span style={{ background:'#f0fdf4', color:'#16a34a', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 14px', borderRadius:100 }}>
                  {fmtR(statesTotalRev)} atribuído
                </span>
              </div>

              {/* col headers */}
              <div style={{ display:'grid', gridTemplateColumns:'28px 120px 1fr 100px 70px 80px', gap:12, padding:'10px 24px', borderBottom:`1px solid ${border}` }}>
                {['#','Estado','Participação','Receita','Pedidos','Ticket'].map((h,i) => (
                  <div key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:muted, textAlign: i > 3 ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>

              {filteredStates.map((s, idx) => {
                const pct = (s.rev / filteredStates[0].rev) * 100;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : String(idx+1);
                const barColor = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#ec4899' : '#3b82f6';
                const isHighTicket = s.ticket > 360;
                return (
                  <div key={s.abbr} style={{
                    display:'grid', gridTemplateColumns:'28px 120px 1fr 100px 70px 80px', gap:12, alignItems:'center',
                    padding:'12px 24px',
                    borderBottom: idx < filteredStates.length-1 ? `1px solid ${border}` : 'none',
                    background: idx < 3 ? (isDark ? 'rgba(255,255,255,0.02)' : (idx===0?'#fffbeb':idx===1?'#f8fafc':'#fdf4ff')) : 'transparent',
                  }}>
                    <div style={{ fontSize:14, textAlign:'center' }}>{medal}</div>
                    <div>
                      <span style={{ fontSize:12, fontWeight:700, color:text }}>{s.name}</span>
                      <span style={{ fontSize:10, color:muted, marginLeft:6, fontWeight:600, background: isDark?'#1a2035':'#f1f5f9', padding:'1px 6px', borderRadius:4 }}>{s.abbr}</span>
                    </div>
                    <div style={{ height:8, background: isDark?'#1e2a3a':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:barColor, borderRadius:100, transition:'width .4s' }} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:text, textAlign:'right' }}>{fmtFull(s.rev)}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:muted, textAlign:'right' }}>{s.orders}</div>
                    <div style={{ fontSize:12, fontWeight:700, color: isHighTicket ? '#f59e0b' : '#10b981', textAlign:'right' }}>
                      R$ {s.ticket.toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* insights */}
            <div style={{
              background: isDark ? '#1a2035' : 'linear-gradient(135deg,#eff6ff,#f0fdf4)',
              border:`1px solid ${isDark?'#2a3a5a':'#bfdbfe'}`,
              borderRadius:20, padding:'22px 28px', marginTop:20,
            }}>
              <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase', color:'#2563eb', marginBottom:14 }}>
                📍 Insights Geográficos · Meta Ads 2026
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { icon:'🏆', title:'SP + RJ + MG = 60% da Receita', body:'Os 3 maiores estados concentram R$537K dos R$892K atribuídos ao Meta. Reforçar segmentação geo nessas praças é prioritário.' },
                  { icon:'💎', title:'Nordeste tem ticket acima da média', body:'BA (R$399), PE (R$387) e CE (R$382) superam a média nacional de R$330. Oportunidade de escalar campanhas premium no Nordeste.' },
                  { icon:'🚀', title:'DF e GO: alto ticket, volume a crescer', body:'Distrito Federal (R$361) e Goiás (R$340) têm tickets saudáveis com pedidos ainda limitados — bom potencial de escala.' },
                  { icon:'🌊', title:'Amazonas: maior ticket do ranking', body:'AM apresenta R$463 de ticket médio, acima de SP e RJ. Vale testar verba incremental com campanhas de produto premium.' },
                ].map(i => (
                  <div key={i.title}>
                    <div style={{ fontSize:12, fontWeight:800, color:text, marginBottom:4 }}>{i.icon} {i.title}</div>
                    <div style={{ fontSize:11, color: isDark?'#94a3b8':'#475569', lineHeight:1.6 }}>{i.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EVOLUÇÃO MENSAL (sempre visível) ── */}
        <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, padding:'22px 24px', marginTop:24 }}>
          <div style={{ fontSize:14, fontWeight:900, color:text, marginBottom:4 }}>Evolução Mensal · Meta Ads 2026</div>
          <div style={{ fontSize:11, color:muted, marginBottom:20 }}>Receita e pedidos mês a mês</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {MONTHS_ORDER.map(m => {
              const d = MONTH_TOTALS[m];
              const isActive = activePeriod === m;
              const ticket = d.orders > 0 ? Math.round(d.rev / d.orders) : 0;
              const maxRev = Math.max(...Object.values(MONTH_TOTALS).map(x => x.rev));
              const barPct = (d.rev / maxRev) * 100;
              return (
                <button key={m} onClick={() => setActivePeriod(m as any)}
                  style={{
                    background: isActive ? '#2563eb' : (isDark?'#0f172a':'#f8fafc'),
                    border:`1px solid ${isActive?'#2563eb':border}`,
                    borderRadius:16, padding:'16px 18px', cursor:'pointer', textAlign:'left',
                    boxShadow: isActive ? '0 6px 20px rgba(37,99,235,0.3)' : 'none',
                    transition:'all .2s',
                  }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color: isActive?'rgba(255,255,255,0.7)':muted, marginBottom:8 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize:18, fontWeight:900, color: isActive?'#fff':text, marginBottom:2 }}>
                    {fmtR(d.rev)}
                  </div>
                  <div style={{ fontSize:11, color: isActive?'rgba(255,255,255,0.65)':muted, marginBottom:12 }}>
                    {d.orders} pedidos · R${ticket} ticket
                  </div>
                  {/* barra */}
                  <div style={{ height:4, background: isActive?'rgba(255,255,255,0.2)':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
                    <div style={{ width:`${barPct}%`, height:'100%', background: isActive?'rgba(255,255,255,0.8)':'#2563eb', borderRadius:100 }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* destaques */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:16 }}>
            <div style={{ background: isDark?'#0f172a':'#f0fdf4', border:`1px solid ${isDark?'#1e3a2a':'#bbf7d0'}`, borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#16a34a', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>📈 Melhor Mês</div>
              <div style={{ fontSize:16, fontWeight:900, color:text }}>Março 2026</div>
              <div style={{ fontSize:11, color:muted }}>R$ 345,7k · 1.106 pedidos</div>
            </div>
            <div style={{ background: isDark?'#0f172a':'#eff6ff', border:`1px solid ${isDark?'#1e2a4a':'#bfdbfe'}`, borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#2563eb', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>📊 Total Acumulado</div>
              <div style={{ fontSize:16, fontWeight:900, color:text }}>R$ 1,044M</div>
              <div style={{ fontSize:11, color:muted }}>3.182 pedidos · Jan–Abr</div>
            </div>
            <div style={{ background: isDark?'#0f172a':'#fefce8', border:`1px solid ${isDark?'#3a2a00':'#fde68a'}`, borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#d97706', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>🎯 Ticket Médio Geral</div>
              <div style={{ fontSize:16, fontWeight:900, color:text }}>R$ 328</div>
              <div style={{ fontSize:11, color:muted }}>Média dos 4 meses</div>
            </div>
          </div>
        </div>

        {/* ── RODAPÉ ── */}
        <div style={{ marginTop:32, paddingTop:16, borderTop:`1px solid ${border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Fonte: Google Analytics 4 · Propriedade 310472089 · casadatoalha.com.br
          </span>
          <span style={{ fontSize:10, color:muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Wigoo Analytics · Dados: Meta Ads · Jan–Abr 2026
          </span>
        </div>

      </div>
    </div>
  );
};

export default GeoAnalysisPage;
