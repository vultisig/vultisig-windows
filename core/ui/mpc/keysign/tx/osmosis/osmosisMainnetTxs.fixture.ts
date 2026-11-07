// Successful amino-signed osmosis-1 transactions, one per message type, read
// from mainnet. Each `msgs` entry was checked against the transaction's own
// secp256k1 signature, so its amino type and field values are what was signed.
export const osmosisMainnetTxs = [
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn',
    txHash: 'A1E29A556C410DAD97C001E5AB585533043D02D4806E6CFE604643C113FC4B0A',
    hexPublicKey:
      '0387aaad78ea455a7c7a46acd6b3cfdf42794922a13776fd82453a997a4d29e64f',
    sequence: '4297',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '42198',
        },
      ],
      gas: '852471',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74372520',
    signature:
      'ecwggARXM8rvpOTU8PwzMXw/d3RqvrRafMyxUypMLeMgGHrrFCBwUFYC90Z14J1UaUX6K0VXIgmHmeyzAs48Dg==',
    msgs: [
      {
        type: 'osmosis/poolmanager/swap-exact-amount-in',
        value: {
          sender: 'osmo10y6p0f0srtsgxqu9glu60wr2962jn6f3g9e5en',
          routes: [
            {
              pool_id: '2639',
              token_out_denom:
                'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
            },
            {
              pool_id: '585',
              token_out_denom:
                'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
            },
          ],
          token_in: {
            denom:
              'ibc/BC26A7A805ECD6822719472BCB7842A48EF09DF206182F8F259B2593EB5D23FB',
            amount: '26240000',
          },
          token_out_min_amount: '500880599',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut',
    txHash: '0EAAF40EAF90F29B2BA2A598AD7F7CB2384B2AED2A92BFF6A2D12A20E8BE2D38',
    hexPublicKey:
      '03b05cad8dffa76a8e6ebe292db893abd7ab0a5b51f72c68cfb2ad36e2a503d75f',
    sequence: '1399',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '49431',
        },
      ],
      gas: '998586',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74338931',
    signature:
      'PsRgIXoHo7BCi5mWuK2q+ExTxVA859TzmgwMBUiSG20MHJL+yRoGGwQ31BMZ3UAF/15octJktDD0oOOwzYotnw==',
    msgs: [
      {
        type: 'osmosis/poolmanager/swap-exact-amount-out',
        value: {
          sender: 'osmo14ltghwl9za20u8mquygh2l4lkaukh8gx69dt8p',
          routes: [
            {
              pool_id: '3509',
              token_in_denom:
                'ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4',
            },
            {
              pool_id: '3497',
              token_in_denom:
                'factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC',
            },
          ],
          token_in_max_amount: '151727922',
          token_out: {
            denom:
              'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
            amount: '100000000',
          },
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn',
    txHash: '7F528AD3233B640BF60C5D4215D9E63DD5B5DC369E9D4E87AFBA829120F9C8F3',
    hexPublicKey:
      '0387aaad78ea455a7c7a46acd6b3cfdf42794922a13776fd82453a997a4d29e64f',
    sequence: '4296',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '36397',
        },
      ],
      gas: '735282',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74372496',
    signature:
      'MwN6kzclodiYRvPfTNX09sGGpFHh1mKYyMFGmEyFVVBxCxPyBRiWPTqKhCmaQXp5ZAuP4JmFRoZq9NSDKDymTw==',
    msgs: [
      {
        type: 'osmosis/poolmanager/split-amount-in',
        value: {
          sender: 'osmo10y6p0f0srtsgxqu9glu60wr2962jn6f3g9e5en',
          routes: [
            {
              pools: [
                {
                  pool_id: '1095',
                  token_out_denom:
                    'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
                },
              ],
              token_in_amount: '4550000',
            },
            {
              pools: [
                {
                  pool_id: '584',
                  token_out_denom:
                    'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
                },
              ],
              token_in_amount: '1950000',
            },
          ],
          token_in_denom: 'uosmo',
          token_out_min_amount: '61712653',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut',
    txHash: '695EB7B753538C4EA74EF72625637085BA33CA84235863B7C4C549BA9ED5F221',
    hexPublicKey:
      '03c64ad78a69900500df1320f19ff8bff7c1126d56fe7969c544d5da0fb3f80d20',
    sequence: '515',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '76893',
        },
      ],
      gas: '1553393',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74319600',
    signature:
      '7E+gLBYFrCZY/++cuPtmPmZjYPf2CR6aQIllsJrE1AweXUlH3rKsC3bx79gbilUNNeiguktc4VgPqVDNldOpYg==',
    msgs: [
      {
        type: 'osmosis/poolmanager/split-amount-out',
        value: {
          sender: 'osmo15ewss529cn45v8xa36nrj2chm2w68cav3amj0y',
          routes: [
            {
              pools: [
                {
                  pool_id: '1135',
                  token_in_denom:
                    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
                },
                {
                  pool_id: '2',
                  token_in_denom: 'uosmo',
                },
              ],
              token_out_amount: '5651899',
            },
            {
              pools: [
                {
                  pool_id: '1',
                  token_in_denom:
                    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
                },
                {
                  pool_id: '1100',
                  token_in_denom: 'uosmo',
                },
              ],
              token_out_amount: '627989',
            },
          ],
          token_out_denom: 'uion',
          token_in_max_amount: '41316082',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.gamm.v1beta1.MsgJoinPool',
    txHash: '81B7526200288A91BE896D968AB2E360F20B25556FF6147D040310E539B9EB06',
    hexPublicKey:
      '02efee9ff45528661f2fc86538d110de8bcf8725a0e44263e6256a677462055e11',
    sequence: '537',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '9400',
        },
      ],
      gas: '261092',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74355168',
    signature:
      'Vha2NLcvYiq3fQrMXL0rPyZ1Jr1iMucXr45odrJMcWVIMPMJGEd/gd1IiYwkE47A1nslBEdIiSSBXq8s27brHQ==',
    msgs: [
      {
        type: 'osmosis/gamm/join-pool',
        value: {
          sender: 'osmo1gagzmtrqnc00ntft2ds373vshf36nfxk4ez3rr',
          pool_id: '2580',
          share_out_amount: '11481056257175660161',
          token_in_maxs: [
            {
              denom:
                'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
              amount: '5125000',
            },
            {
              denom:
                'ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4',
              amount: '6718398',
            },
          ],
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.gamm.v1beta1.MsgExitPool',
    txHash: 'E3A48E7777022921800A8ACF3827D3037EEEF023C4D176475D236CEB3DB810B4',
    hexPublicKey:
      '02efee9ff45528661f2fc86538d110de8bcf8725a0e44263e6256a677462055e11',
    sequence: '538',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '9281',
        },
      ],
      gas: '257802',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74355202',
    signature:
      'vZVy0biKu/3naA96axBvHJNim2qtnxcU8xWbPE3s+EsphKEQ1eZtdS/niGoATij++c7wP+kFuzSx1gW2hsymxQ==',
    msgs: [
      {
        type: 'osmosis/gamm/exit-pool',
        value: {
          sender: 'osmo1gagzmtrqnc00ntft2ds373vshf36nfxk4ez3rr',
          pool_id: '2580',
          share_in_amount: '11481057978630232965',
          token_out_mins: [
            {
              denom:
                'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
              amount: '4875000',
            },
            {
              denom:
                'ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4',
              amount: '6390671',
            },
          ],
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
    txHash: '34ED6D1777BAF6E25FFCBFE4CE84B5239754347123E0272FC6CE0FE457F74BD4',
    hexPublicKey:
      '0244380be7deb44843c73fdc9513cec6de104ff10d0e4d2f85ae35e3d032cbab74',
    sequence: '52171',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '5933',
        },
      ],
      gas: '197753',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74342678',
    signature:
      'zzgsZ8BCAJRiAHbx5sLcKv1iI4Kbaugqa7e4lqMde81GYSXdHBgwb2Bonk6B1zIPwF4pztOrzMuhc4HFEnsH0Q==',
    msgs: [
      {
        type: 'osmosis/gamm/join-swap-extern-amount-in',
        value: {
          sender: 'osmo12v593j0jje7gx4vfwcqr22nldretj9wgknufpr',
          pool_id: '1',
          token_in: {
            denom: 'uosmo',
            amount: '20000000',
          },
          share_out_min_amount: '37081599356427777051',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition',
    txHash: '4023CEAA276E30000CF68B8A8DBB2D5C9778DD8F935D4F322493EF4858E85217',
    hexPublicKey:
      '03b5ece411418133073defb9881fb973ae717e43ea99127d9f27779a8ee70d4176',
    sequence: '33',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '23104',
        },
      ],
      gas: '641759',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74372562',
    signature:
      '1OUn1OsweW07xaX8RgQUMVln7bI2mBrZmEWmpZE/2CxIXK09nbMAa6x9IaOfq4LJjN/UX8EdgbNptQBka8Fl8A==',
    msgs: [
      {
        type: 'osmosis/cl-create-position',
        value: {
          pool_id: '3511',
          sender: 'osmo13sclz8nsnssj5udrkj92vdr5gn5h26vawvmpqa',
          lower_tick: '-79877000',
          upper_tick: '-79100000',
          tokens_provided: [
            {
              denom:
                'factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC',
              amount: '19843942',
            },
            {
              denom:
                'factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH',
              amount: '35460097343387316',
            },
          ],
          token_min_amount0: '30141082741879218',
          token_min_amount1: '0',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition',
    txHash: '1A8A1A143ADC2E603085F2C3B5F9B99C9D006BFD251CBED079422F547A805064',
    hexPublicKey:
      '02aa3d723174c83959e26c842642525c7d7f18549ef9eeaf85c90f5a89add0a5e4',
    sequence: '4105',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '36556',
        },
      ],
      gas: '1218528',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74367257',
    signature:
      'xBI/X0S+B3SoPAs7GIY8/Q7KCKxYTf8YKbygVpJJBQ0KRG9jQH+1ApzpVVfcNHBpY2kfAimb6cuMnmb+x1cxwQ==',
    msgs: [
      {
        type: 'osmosis/cl-add-to-position',
        value: {
          position_id: '15536387',
          sender: 'osmo1vumgtqe0qcrm2qzmydaw4ecnwkwj7avazy0vvm',
          amount0: '0',
          amount1: '128690000',
          token_min_amount0: '0',
          token_min_amount1: '102952000',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition',
    txHash: '01896572432BAB543274FF51E31D8332A60DAE6AF20F1E8F77793311914FE340',
    hexPublicKey:
      '02c5ce2aad1010885dff9026367ec9cd1be1fa3be3f27ca7b9d1db27121e5b93f8',
    sequence: '6543',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '32639',
        },
      ],
      gas: '906627',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74372661',
    signature:
      'cujF9MBvcocwN83s0wbWWyiR3BQKZ+euadnTasfzwOU+yN4BHXuIhrsoN4qayi/sE4FWZrBSccIHfJpr5KL8ww==',
    msgs: [
      {
        type: 'osmosis/cl-withdraw-position',
        value: {
          position_id: '15536414',
          sender: 'osmo1dw6lp2c6entr2u0vc40jl0jdnqj6zmtxwsw2cf',
          liquidity_amount: '2362214021558657909020793282',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards',
    txHash: 'AD94E647F68CB00609C08DCDA26FF7AA6FAF0B17BDD6A7FFC06525A1A9069E67',
    hexPublicKey:
      '02c5ce2aad1010885dff9026367ec9cd1be1fa3be3f27ca7b9d1db27121e5b93f8',
    sequence: '6541',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '15499',
        },
      ],
      gas: '430506',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74372641',
    signature:
      '3D/vL3dxCPJ0eUAIbJVbosNQbFzzCqM7CQxZGWFnfhF64YIuG6Hp1pVlEd6ni1gg/QUHo77SKX4JteAizLn/Lg==',
    msgs: [
      {
        type: 'osmosis/cl-col-sp-rewards',
        value: {
          position_ids: ['15536411', '15536414'],
          sender: 'osmo1dw6lp2c6entr2u0vc40jl0jdnqj6zmtxwsw2cf',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives',
    txHash: '5FC2680EEAA27732D418F620CCA5F336B55E637A0B42C676AAD2C4105002DDFF',
    hexPublicKey:
      '032a9afd3da69af3aa8444f69276faf92a55839936b43716759a139d446f90cb93',
    sequence: '1941',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '22140',
        },
      ],
      gas: '615000',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74366058',
    signature:
      'u0h3u9U5aQIQIP9p78CHvTa7KBJ981MTgv9UwETIY6gGJntKjzDW9LdfNMuWO16bkXa+7LQ33qcKQyhQMQeO3A==',
    msgs: [
      {
        type: 'osmosis/cl-col-sp-rewards',
        value: {
          position_ids: ['15533608'],
          sender: 'osmo195fwlkepwev7hsd9f4fmcnhp2kv0gcrlvdujq5',
        },
      },
      {
        type: 'osmosis/cl-collect-incentives',
        value: {
          position_ids: ['15533608'],
          sender: 'osmo195fwlkepwev7hsd9f4fmcnhp2kv0gcrlvdujq5',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference',
    txHash: '0A48A798358E600978B58606392B623FD7097E9BAC1E9E8C3E3651C9E99110B2',
    hexPublicKey:
      '03bb63ab6605d44d2fbf23db6d8873f9d7babf770c38a43bc34b00330ba48f4d1f',
    sequence: '2501',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '3795',
        },
      ],
      gas: '126480',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '73960466',
    signature:
      'Tp6puwkjk+R/ERfVxmYsATTTDdDRLWl9KY2P845VU7ZEVAtEwA06E7yat6CHMzD7xsIxmeCSsAp5MtcLc7OLWQ==',
    msgs: [
      {
        type: 'osmosis/MsgSetValidatorSetPreference',
        value: {
          delegator: 'osmo1zhx5fwuqcx432vwwckwhwwt2jf5gtdfg6snpr6',
          preferences: [
            {
              val_oper_address:
                'osmovaloper1z89utvygweg5l56fsk8ak7t6hh88fd0axx2fya',
              weight: '333333333333333333',
            },
            {
              val_oper_address:
                'osmovaloper1nna7k5lywn99cd63elcfqm6p8c5c4qcu6ex2gp',
              weight: '333333333333333333',
            },
            {
              val_oper_address:
                'osmovaloper130r77dtdgz3yjyyskhrr3j2c90aqezugkhr3rs',
              weight: '333333333333333333',
            },
          ],
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet',
    txHash: 'BED043107039AB86DB413152A3BF098D95580CF6B788AC2728A7DE91F69BA747',
    hexPublicKey:
      '0385d2c9513ab03e0ebc5d362160aae7a79621c1d7ccf833cbabda9d7e4f3eb4e4',
    sequence: '8438',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '13027',
        },
      ],
      gas: '361847',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74369064',
    signature:
      'OXHcB+92UYH208b3KR4pB6rrM7IOQKLgogLzbY2iuawmSDQ5VLwwAefE/gk5Uk3/fOzgP19abblWPj5L6p6G/A==',
    msgs: [
      {
        type: 'osmosis/MsgDelegateToValidatorSet',
        value: {
          delegator: 'osmo1l7l5nr92qx7gnf6pplr9mtfv9lv7gecdek8alm',
          coin: {
            denom: 'uosmo',
            amount: '8000000',
          },
        },
      },
    ],
  },
  {
    typeUrl:
      '/osmosis.valsetpref.v1beta1.MsgUndelegateFromRebalancedValidatorSet',
    txHash: '27E401E59697AD18C6E37D59DD33E19F90BACA83073F354B6EFB7FCA43083EA7',
    hexPublicKey:
      '026f335d861413b1e3035fec8ce86e4ae0721aac9d524e6b8c836e2fb4f57fb909',
    sequence: '585',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '29468',
        },
      ],
      gas: '818535',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74295935',
    signature:
      '0Er59jNb5PP/n7bIo/Ny7OW+XFTWJvV9nMIPzaGdEqM2IYZawvhaaBdNftXt71croiOOtp+eNCSanSrJhj5k6w==',
    msgs: [
      {
        type: 'osmosis/MsgUndelegateFromRebalValset',
        value: {
          delegator: 'osmo1dvp8us2s7hh4ufwcu28wm0nlq3wx9q997lxvwa',
          coin: {
            denom: 'uosmo',
            amount: '278020000',
          },
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards',
    txHash: '4ACC9DA4486468F2E5A9376FC5A99AF470ECEA4244E08AFE15A193708DF9E488',
    hexPublicKey:
      '020f5054b89b444e645cfd03957eafcbc10e90a109fd012282134e396afdd85c50',
    sequence: '795',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '96029',
        },
      ],
      gas: '960287',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '73277117',
    signature:
      'jIy8IHdFqlvO5pvnDwTipTormS3gyMMtO3dgVJqJf7Qq1pyEshneY9ezbgdAuM9wr1Cp1LY9wRR18nFXqchpQw==',
    msgs: [
      {
        type: 'osmosis/MsgWithdrawDelegationRewards',
        value: {
          delegator: 'osmo16vpc5xeevt37fj9kmj49sh8j5kxa3leqsnynmp',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.smartaccount.v1beta1.MsgAddAuthenticator',
    txHash: '9A2D4DFE34D6E74F48B5CDFD637CA2149E2BA3842CCC43384A8414DFFBD573D2',
    hexPublicKey:
      '02e8c757d31f3510c615be0865ce5fce26e16680b76f65f233be1f31b12766a3e5',
    sequence: '32',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '12314',
        },
      ],
      gas: '342050',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74356904',
    signature:
      'SKWKByxgamS66aVRRqCOARCSKIESog9KegQtWsHaB+tmgPQIr1gD+rdlua7OxZkDFYGQxVRdEBW4shUUOGPGQg==',
    msgs: [
      {
        type: 'osmosis/smartaccount/add-authenticator',
        value: {
          sender: 'osmo1w907l8u4x82xlyx2mhr00rr4wtqzugt5lcr6fw',
          authenticator_type: 'AllOf',
          data: 'W3sidHlwZSI6IlNpZ25hdHVyZVZlcmlmaWNhdGlvbiIsImNvbmZpZyI6IkFpTk9WQzdRQzVpVzZabDRuTnBRbFFxWHNVaU1DRE00K2c1M0puWE93cjQyIn0seyJ0eXBlIjoiQ29zbXdhc21BdXRoZW50aWNhdG9yVjEiLCJjb25maWciOiJleUpqYjI1MGNtRmpkQ0k2SUNKdmMyMXZNVEI0Y1hZNGNteHdhMlpzZVhkdE9USnJOWGRrYlhCc2VuazNhMmgwWVhOc09XTXlZekE0Y0hOdGRteDFOVFF6YXpjeU5ITjVPVFJyTnpRaUxDQWljR0Z5WVcxeklqb2dJbVY1U25OaFZ6RndaRU5KTmtscVZYZE5SRUYzVFVSQmQwMUVRV2xNUTBwNVdsaE9iR1JHT1hkYVdFcHdZakpSYVU5cFNtdFpXR3RwVEVOS01HRlhNV3hZTW5od1lsZHNNRWxxY0RkSmJWWjFXa05KTmtscVJUTlBWRkV5VFdwcmQwNXFRWGROUkVGM1RVUkJkMDFFUVdsbVdEQTlJbjA9In0seyJ0eXBlIjoiQW55T2YiLCJjb25maWciOiJXM3NpZEhsd1pTSTZJazFsYzNOaFoyVkdhV3gwWlhJaUxDSmpiMjVtYVdjaU9pSmxlVXBCWkVoc2QxcFRTVFpKYVRsMll6SXhkbU15YkhwTWJrSjJZako0ZEZsWE5XaGFNbFo1VEc1WmVGbHRWakJaVkVWMVZGaE9ibFV6WkdoalJWWTBXVmRPTUZGWE1YWmtWelV3VTFjMGFXWlJQVDBpZlN4N0luUjVjR1VpT2lKTlpYTnpZV2RsUm1sc2RHVnlJaXdpWTI5dVptbG5Jam9pWlhsS1FXUkliSGRhVTBrMlNXazVkbU15TVhaak1teDZURzVDZG1JeWVIUlpWelZvV2pKV2VVeHVXWGhaYlZZd1dWUkZkVlJZVG01Vk0wSnpZVmhTVTJJelZqQmFWazR6V1ZoQ1JtVkhSbXBrUlVaMFlqTldkV1JGYkhWSmJqQTlJbjBzZXlKMGVYQmxJam9pVFdWemMyRm5aVVpwYkhSbGNpSXNJbU52Ym1acFp5STZJbVY1U2tGa1NHeDNXbE5KTmtscE9YWmpNakYyWXpKc2VreHVRblppTW5oMFdWYzFhRm95Vm5sTWJsbDRXVzFXTUZsVVJYVlVXRTV1VlROa2FHTkZWalJaVjA0d1VWY3hkbVJYTlRCVU0xWXdTVzR3UFNKOUxIc2lkSGx3WlNJNklrMWxjM05oWjJWR2FXeDBaWElpTENKamIyNW1hV2NpT2lKbGVVcEJaRWhzZDFwVFNUWkphVGwyWXpJeGRtTXliSHBNYmtKMllqSjRkRmxYTldoYU1sWjVURzVaZUZsdFZqQlpWRVYxVkZoT2JsVXpRbk5oV0ZKVFlqTldNRnBXVGpOWldFSkdaVWRHYW1SRlJuUmlNMVoxWkVVNU1XUkRTamtpZlN4N0luUjVjR1VpT2lKTlpYTnpZV2RsUm1sc2RHVnlJaXdpWTI5dVptbG5Jam9pWlhsS1FXUkliSGRhVTBrMlNXazVkbU15TVhaak1teDZURzFPZG1KdFRteGlibEo1V1ZoU2JGcEhlSEJqV0Zad1drZHNNR1ZUTlRKTlYwcHNaRWRGZUV4ck1YcGFNV1J3WkVkb2EyTnRSak5WUnpsNllWaFNjR0l5TkdsbVVUMDlJbjBzZXlKMGVYQmxJam9pVFdWemMyRm5aVVpwYkhSbGNpSXNJbU52Ym1acFp5STZJbVY1U2tGa1NHeDNXbE5KTmtscE9YWmpNakYyWXpKc2VreHVXbWhpU0U1c1pFaENlVnBYV1hWa2FrWnBXbGhTYUUxVE5VNWpNbVJVV2xoU1YxbFhlSEJhUjBZd1lqTktWRnBZVWxGamJWWnRXbGhLYkdKdFRteEpiakE5SW4xZCJ9XQ==',
        },
      },
    ],
  },
  {
    typeUrl: '/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator',
    txHash: 'D43F0828F7F652B78D1C0F7141A31E8C168BA699357F979D511A5AE5D37C6F68',
    hexPublicKey:
      '02aa3e984437c819cf6c98a0415faed1e743968d151f32141fdd4aeca3bfe7c70d',
    sequence: '413',
    fee: {
      amount: [
        {
          denom: 'uosmo',
          amount: '9816',
        },
      ],
      gas: '198302',
    },
    memo: 'OsmosisFE',
    timeoutHeight: '74339471',
    signature:
      'BHG5F1f/hdy2X7HhaIB1D3FxvYQc4AnBZSgsbD5GE3k8pI6UfWzB4mJ8ki/7JqYQogoSAas6l/hMctfEDqDdkw==',
    msgs: [
      {
        type: 'osmosis/smartaccount/remove-authenticator',
        value: {
          sender: 'osmo17ueasm60w4clv4lfq6yt4gkkged5rgdxejxvaz',
          id: '607305',
        },
      },
    ],
  },
]
