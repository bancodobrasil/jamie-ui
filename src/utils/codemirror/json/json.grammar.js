// This file was generated by lezer-generator. You probably shouldn't edit it.
import { LRParser, LocalTokenGroup } from '@lezer/lr';
import { expressionToken, trackShiftTerm } from './tokens';

export const parser = LRParser.deserialize({
  version: 14,
  states:
    "-tOYQPOOP!QOPOOOOQW'#Cg'#CgO!VQPO'#CjO!_QPO'#CoO!fQXO'#CpO!nQXO'#CzO!sQXO'#DRO!{QXO'#DTO#QQPO'#DVOOQW'#Dk'#DkOOQW'#De'#DeQOQPOOP#VO`O'#C`POOO)C?U)C?UOOQO'#Cl'#ClO#bQPO'#CkO#gQPO'#DgOOQW,59U,59UO#oQPO,59UO#tQPO'#DjOOQW,59Z,59ZO#|QPO,59ZO$RQXO'#CuO$WQYO'#CrO$fQQO,59[O$kQ[O'#CrO$|QSO,59fO%PQSO,59mO%UQPO,59oOOQW,59q,59qPOOO'#DW'#DWP%ZO`O,58zPOOO,58z,58zOYQPO,59VO!YQPO'#DXO%fQPO,5:ROOQW1G.p1G.pOYQPO'#DYO%nQPO,5:UOOQW1G.u1G.uO%vQPO,59aO%{QXO'#CrO&ZQPO'#CvOOQW'#DZ'#DZO&`QYO,59^OOQO,59^,59^OOQW1G.v1G.vO&hQ[O,59^O&sOpO'#C|O&xQPO'#DnOOQW1G/Q1G/QO%PQSO1G/QOOQW1G/X1G/XO%PQSO1G/ZPOOO-E7U-E7UPOOO1G.f1G.fOOQO1G.q1G.qOOQO,59s,59sOOQO-E7V-E7VOOQO,59t,59tOOQO-E7W-E7WOOQW1G.{1G.{O'PQXO,59^O'XQXO,59bOOQW-E7X-E7XOOOO'#D['#D[O'cOpO,59hOOQO'#D^'#D^O'kQPO,5:YO'rQXO,5:YOOQW7+$l7+$lOOQW7+$u7+$uOOQW'#Cx'#CxOOQW1G.|1G.|OOOO-E7Y-E7YO'wOpO1G/SOOQO-E7[-E7[O(PQXO1G/tO(UQSO1G/tO(ZOpO7+$nO(cOpO7+$nO(kQSO7+%`OOQW7+%`7+%`O(pOpO<<HYO(xOpO<<HYO(pOpO<<HYOOQO<<HY<<HYOOQW<<Hz<<HzO)TOpOAN=tO)WOpOAN=tOOQOAN=tAN=tOOOO,59w,59wOOOO-E7Z-E7ZOOQOG23`G23`O)`OpOG23`P)kOpO'#D[OOQOLD(zLD(z",
  stateData:
    ')s~O!TOS!UPQ~OVZOWZOXZOYZO]RObSOeTOoUOvVOxWO!YQO!cXO~O!U]O~O[bO!Y_O~OaeO~PYOQhOhgO~OQjO~OQjOhgO~OQmO~OeTO~OToO!VoO!WqO~O![rO~O!]sO[!ZX~O[uO~O!]vOa!^X~OaxO~OQzO~OP!OOR{OhgOmfX~Om!PO~OP!OOR{OhgOqfXsfX~Oq!ROs!SO~O!Y!WO~OToO!VoO!W!YO~O!]sO[!Za~O!]vOa!^a~Og!`O~OP!OOR{OhgOgfX~Ok!bO~OR{Omfa~OR{Oqfasfa~O!`!dO~Ot!hO~PYOR{Ogfa~OP!kOhgO~PYO!`!dO!a!nO~Ot!pO~PYOQ!qO~Or!sO!`!dO~OQ!tO~Os!uO~Or!vO!`!dO~O!`!dO!a!yO~Os!zO~O!`!dO!a!}O~Or#OO!`!dO!a!}O~Or#OO!`!dO!a#QO~Or#OO!`!dO!a#TO~Or#OO!`!dO~O',
  goto: '&l!cPPPP!dPPPPPP!gPP!g!p!vPP!g!zP#WPP#d#rP#zP#}P$WPPPP#}P#}P#}$Z$a$g$m${%e%oPPPPPP%uP&YPP&]!gPP&`R^P_ZOSrv!S!b!gQaRR![sT`Rs^YOSrv!S!b!gRnXQiTQkUQlVRygQiTQlVU!OhjzR!k!b]|hjz}!Q!aR!l!b_YOSrv!S!b!gR!UkQp]R!XpQtaR!]tQwdR!_wQ}hQ!QjQ!azV!c}!Q!aQ!e!R[!m!e!r!w!{#R#SQ!r!nQ!w!sS!{!v!xR#R!|Q!x!sQ!|!vT#P!x!|Q!g!SR!o!gQ[OQdSQ!ZrQ!^vS!f!S!gR!k!bRcRRfSQ!TkQ!VlQ!i!UR!j!W',
  nodeNames:
    '⚠ Context HelperOrContext HashArgumentProperty Comment CommentContent JsonText True False Null Number String } { Object Property PropertyName ] [ Array Expression OpeningExpression ExpressionContent SubExpressionClose SubExpressionOpen SubExpression HashArgument = HashValue ClosingExpression BlockExpression BlockExpressionOpen BlockParameters as BlockParameterName HTMLEscapedExpressionClose BlockExpressionEnd PartialBlockExpression PartialBlockExpressionOpen InlinePartialExpression InlinePartialExpressionOpen EscapedExpression',
  maxTerm: 65,
  context: trackShiftTerm,
  nodeProps: [
    ['openedBy', 12, '{', 17, '[', 23, 'SubExpressionOpen', 35, 'HTMLEscapedExpressionOpen'],
    [
      'closedBy',
      13,
      '}',
      18,
      ']',
      24,
      'SubExpressionClose',
      -4,
      31,
      36,
      38,
      40,
      'HTMLEscapedExpressionClose',
    ],
  ],
  skippedNodes: [0, 4, 5, 42],
  repeatNodeCount: 7,
  tokenData:
    "-W~RgXY!jYZ!j]^!jpq!jrs!oxy%Xyz%^|}%c}!O%h!Q!R%q!R!['P![!]'b!_!`'g!}#O'l#O#P'q#P#Q'v#T#U'{#Y#Z(W#b#c(u#h#i)^#o#p)u#q#r+r#r#s,p~!oO!T~~!rWpq!oqr!ors#[s#O!o#O#P#a#P;'S!o;'S;=`%R<%lO!o~#aO!Y~~#dXrs!o!P!Q!o#O#P!o#U#V!o#Y#Z!o#b#c!o#f#g!o#h#i!o#i#j$P~$SR!Q![$]!c!i$]#T#Z$]~$`R!Q![$i!c!i$i#T#Z$i~$lR!Q![$u!c!i$u#T#Z$u~$xR!Q![!o!c!i!o#T#Z!o~%UP;=`<%l!o~%^Oh~~%cOg~~%hO!]~~%kQ!Q!R%q!R!['P~%vRY~!O!P&P!g!h&e#X#Y&e~&SP!Q![&V~&[RY~!Q![&V!g!h&e#X#Y&e~&hR{|&q}!O&q!Q![&w~&tP!Q![&w~&|PY~!Q![&w~'USY~!O!P&P!Q!['P!g!h&e#X#Y&e~'gO![~~'lOk~~'qOb~~'vO!c~~'{Oa~~(OP#g#h(R~(WOq~~(ZP#T#U(^~(aP#`#a(d~(gP#g#h(j~(mP#X#Y(p~(uOW~~(xP#i#j({~)OP#`#a)R~)UP#`#a)X~)^OX~~)aP#f#g)d~)gP#i#j)j~)mP#X#Y)p~)uOV~~)zP]~#o#p)}~*SUe~qr*fst*k!P!Q+Q!`!a+V#o#p+[#r#s+d~*kO!U~~*pQo~z{*v!`!a*{~*{Ox~~+QOv~~+VOt~~+[Oe~~+aPe~#o#p+V~+iRe~st*k!P!Q+Q!`!a+Vl+wP[S#q#r+zh,RQmWs`|},X#q#r,`h,`OmWs`W,eQmW|},k#q#r,kW,pOmWh,sP#q#r,vh,yP#q#r,|h-TPmWs`|},X",
  tokenizers: [
    2,
    3,
    4,
    expressionToken,
    new LocalTokenGroup('{~RRYZ[#q#ra#r#st~aO!V~~dP#q#rg~lP!W~|}o~tO!W~~wP#q#ra~', 42, 5),
    new LocalTokenGroup('m~RTXYbYZb]^bpqb#p#qg~gO!`~~lO!a~~', 28, 34),
  ],
  topRules: { JsonText: [0, 6] },
  tokenPrec: 0,
});
