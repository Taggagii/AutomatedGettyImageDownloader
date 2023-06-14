const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');

const reloadAndGetCaptcha = async (page) => {
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    let token_input = await page.$('input#codecyan-token-hidden')

    let recaptcha_token = await token_input.evaluate((el) => el.getAttribute('value'))

    return recaptcha_token;
}

const sites = [
    "https://www.gettyimages.ca/detail/news-photo/referees-and-team-captains-from-l-r-tomasz-listkiewicz-news-photo/1450682119?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-his-sides-victory-in-a-news-photo/1245714905?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-passes-by-jerome-boateng-of-news-photo/472748248?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-passes-by-jerome-boateng-of-news-photo/472748248?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-passes-by-jerome-boateng-of-news-photo/472748228?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-chips-the-ball-over-goalkeeper-news-photo/472365808?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-vies-with-news-photo/472356930?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/bayern-munichs-brazilian-defender-rafinha-fails-to-save-a-news-photo/472365518?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-leo-messi-laments-during-his-press-conference-to-news-photo/1333000259?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelona-players-including-javier-mascherano-lionel-messi-news-photo/476127646?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-and-xavi-hernandez-of-barcelona-celebrate-with-news-photo/476132580?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/luis-suarez-lionel-messi-and-neymar-of-barcelona-celebrate-news-photo/476132834?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/luis-suarez-lionel-messi-and-neymar-of-barcelona-holds-the-news-photo/476142304?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-forward-lionel-messi-celebrates-scoring-the-news-photo/1245125342?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-scores-the-opening-goal-during-news-photo/1245125572?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/leo-messi-of-paris-saint-germain-and-cristiano-ronaldo-of-news-photo/1457735277?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-scoring-his-teams-news-photo/114915020?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-past-manchester-united-news-photo/88019620?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-forward-lionel-messi-shoots-score-as-he-is-news-photo/984488440?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-forward-lionel-messi-celebrates-his-goal-during-news-photo/984481422?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-he-scores-the-news-photo/985201862?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-scoring-his-news-photo/1450691577?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messis-boots-after-the-fifa-world-cup-qatar-2022-news-photo/1451148631?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-scoring-the-first-goal-news-photo/1451149688?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-forward-lionel-messi-touches-the-trophy-as-he-news-photo/1245710815?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-poses-with-the-budweiser-player-news-photo/1450120739?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-midfielder-enzo-fernandez-argentinas-forward-news-photo/1245714166?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/players-look-on-as-jules-kounde-of-france-tries-in-vain-to-news-photo/1450130564?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-qatar-news-photo/1450133053?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-scores-the-teams-first-penalty-news-photo/1450138337?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-holding-the-world-cup-and-news-photo/1450166430?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-world-cup-trophy-after-news-photo/1245716989?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-world-cup-trophy-after-news-photo/1245716958?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-paulo-dybala-nicolas-otamendi-lautaro-martinez-news-photo/1450254261?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-qatar-news-photo/1450257973?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-scores-a-goal-to-make-it-3-2-news-photo/1245722677?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-scoring-the-news-photo/1450276123?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/antonela-roccuzzo-wife-of-lionel-messi-of-argentina-news-photo/1450292192?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-qatar-news-photo/1450281434?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-qatar-news-photo/1450403583?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-scoring-his-news-photo/1450691568?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-is-presented-with-the-fifa-world-news-photo/1450775483?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-winners-news-photo/1450775608?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/players-look-on-as-jules-kounde-of-france-tries-in-vain-to-news-photo/1450842318?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-winners-news-photo/1450776375?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-qatar-news-photo/1451145634?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-receives-a-bisht-from-sheikh-news-photo/1451090617?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-qatar-news-photo/1451357931?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/the-golden-ball-award-goes-to-lionel-messi-of-argentina-news-photo/1451378028?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-qatar-news-photo/1451380807?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-qatar-news-photo/1451380995?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-qatar-news-photo/1451381152?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-fifa-world-cup-qatar-news-photo/1451869796?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-qatar-news-photo/1451936359?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-celebrates-with-fans-and-team-mates-after-news-photo/1453253710?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-fifa-world-cup-qatar-news-photo/1457417757?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/fans-of-argentina-play-with-a-ball-while-waiting-for-the-news-photo/1245735040?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-captain-and-forward-lionel-messi-holds-the-fifa-news-photo/1245740414?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/fans-of-argentina-cheer-as-the-team-parades-on-board-a-bus-news-photo/1245751494?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/diego-maradona-head-coach-of-argentina-controls-the-ball-as-news-photo/1142935867?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-controls-the-ball-during-a-news-photo/1142934973?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-poses-with-his-brother-rodrigo-sister-mar%C3%ADa-news-photo/1143289394?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-controls-the-ball-during-a-private-photo-news-photo/1143289490?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentine-footballer-lionel-messi-poses-during-a-private-news-photo/1142295294?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentine-footballer-lionel-messi-poses-during-a-private-news-photo/1142295297?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-kisses-the-trophy-as-he-news-photo/1328072386?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-trophy-with-teammates-news-photo/1328073266?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-hugs-neymar-jr-of-brazil-after-news-photo/1328070442?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-reacts-as-his-team-wins-the-final-news-photo/1328694628?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-lifts-the-trophy-after-winning-news-photo/1330775315?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-walks-to-take-a-corner-kick-news-photo/1449013234?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-compete-for-the-ball-with-mateo-news-photo/1449013665?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-scores-the-first-goal-from-the-news-photo/1448999057?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-smiles-in-front-of-the-news-photo/1448991750?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/julian-alvarez-of-argentina-celebrates-with-lionel-messi-news-photo/1449015852?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-battles-with-josko-gvardiol-of-news-photo/1245600576?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-battles-with-josko-gvardiol-of-news-photo/1245600881?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-faces-the-media-during-a-press-news-photo/1333006985?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-shoots-to-score-news-photo/955415208?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-after-scoring-his-news-photo/955410340?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-after-scoring-his-news-photo/955410340?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-his-news-photo/955673156?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-with-his-team-mate-news-photo/955673608?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-with-his-team-mate-news-photo/955673934?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-gives-his-thumbs-up-during-the-news-photo/955673870?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-scoring-his-teams-news-photo/1136451773?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-his-news-photo/1136457928?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-his-news-photo/1136457935?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-news-photo/1131254590?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-looks-on-during-the-la-liga-news-photo/1136482030?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-scoring-his-teams-news-photo/1136482002?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-scoring-his-teams-first-goal-news-photo/1136440063?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-scoring-his-teams-news-photo/1136451773?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/ballon-dor-nominees-lionel-messi-of-argentina-and-fc-news-photo/461440006?adppopup=true",
    "https://static01.nyt.com/images/2017/04/24/sports/24CLASICO/24CLASICO-superJumbo-v2.jpg?quality=75&auto=webp",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-poses-after-news-photo/894818600?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-his-sides-third-goal-from-news-photo/1146318879?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-after-he-scores-his-news-photo/1146320180?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/alisson-becker-of-liverpool-fails-to-stop-lionel-messi-of-news-photo/1140607222?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-his-sides-third-goal-from-news-photo/1146321708?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-his-teams-third-goal-news-photo/1146322521?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-a-free-kick-to-make-it-3-0-news-photo/1146483921?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-a-free-kick-to-make-it-3-0-news-photo/1146483927?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-a-free-kick-to-make-it-3-0-news-photo/1146483932?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-in-action-during-the-uefa-news-photo/1146487126?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-leaves-the-field-after-being-news-photo/543244504?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-gestures-after-being-defeated-by-news-photo/543244276?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-waits-to-receive-the-second-place-news-photo/543246704?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-gestures-after-missing-his-shot-news-photo/543243818?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-waits-with-his-teammates-to-receive-news-photo/543246620?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-shows-his-dejection-after-failing-news-photo/543246512?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-waits-to-receive-the-second-place-news-photo/543246704?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-10-of-argentina-distraught-on-the-half-way-news-photo/543491082?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-is-passing-by-the-trophy-after-news-photo/452123698?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/goalkeeper-manuel-neuer-of-germany-lionel-messi-of-news-photo/452836614?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-receives-the-second-place-medal-news-photo/452118930?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-takes-his-medal-off-after-being-news-photo/452118302?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-looks-at-the-world-cup-trophy-news-photo/1450455292?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-controls-the-ball-against-josip-news-photo/459424218?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-neymar-and-kylian-mbappe-of-paris-saint-news-photo/1343632518?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-looks-on-with-kylian-mbappe-of-news-photo/1450092351?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/kylian-mbappe-of-paris-saint-germain-looks-on-as-teammates-news-photo/1355608248?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/kylian-mbappe-of-paris-saint-germain-reacts-as-teammates-news-photo/1355358882?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/leo-messi-of-barcelona-fc-displays-his-four-ballons-dor-to-news-photo/159581755?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-excepts-his-sixth-ballon-dor-award-from-luka-news-photo/1191653573?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/paris-saint-germains-argentine-forward-lionel-messi-reacts-news-photo/1236893481?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-as-he-scores-their-news-photo/671994650?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-scores-his-teams-third-goal-news-photo/671998026?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-news-photo/671994008?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-pats-the-badge-on-his-shirt-as-he-news-photo/1146563491?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-news-photo/153620417?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-with-neymar-after-news-photo/457848108?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-with-his-team-mate-news-photo/150946004?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-after-scoring-his-news-photo/897565346?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-news-photo/671989562?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-his-news-photo/955673244?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-news-photo/671996182?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-as-he-scores-their-news-photo/671989740?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-a-news-photo/671987388?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-celebrates-news-photo/88016783?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-poses-during-the-official-fifa-news-photo/101658823?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/emiliano-martinez-and-lionel-messi-of-argentina-celebrate-news-photo/1330775269?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-holds-the-trophy-alloft-after-news-photo/159072958?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/antoine-griezmann-of-fc-barcelona-celebrates-with-teammate-news-photo/1190478084?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-celebrates-after-winning-the-news-photo/1233914101?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-is-embraced-by-robert-lewandowski-news-photo/1445831451?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-scores-the-teams-third-goal-past-news-photo/1450095944?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelona-and-argentinas-forward-lionel-messi-poses-with-news-photo/504563316?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/karim-benzema-ri-of-real-madrid-cf-celebrates-scoring-their-news-photo/1383630493?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-his-news-photo/1130323447?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-and-barcelona-fc-receives-the-news-photo/107959465?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-scores-their-teams-first-goal-news-photo/1444800199?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-competes-for-the-ball-with-news-photo/1127866284?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/neymar-and-lionel-messi-of-barcelona-walk-off-in-good-news-photo/470166305?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/kylian-mbappe-of-france-consoles-lionel-messi-of-argentina-news-photo/987978112?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-zlatan-ibrahimovic-and-thierry-henry-of-news-photo/98648057?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-captain-and-forward-lionel-messi-holds-the-fifa-news-photo/1245740669?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-lifts-the-trophy-after-victory-news-photo/114916035?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-with-his-team-mate-news-photo/955673608?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-the-news-photo/475718352?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-celebrates-after-scoring-against-news-photo/1235151111?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-and-barcelona-fc-receives-the-news-photo/107959472?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/dejected-lionel-messi-of-argentina-reacts-after-being-news-photo/452110612?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-the-first-goal-with-news-photo/82380032?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-scoring-his-news-photo/450680948?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-in-action-during-a-paris-germain-training-news-photo/1333788296?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/nominees-for-the-best-fifa-football-player-barcelona-and-news-photo/865478880?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/argentinas-lionel-messi-is-thrown-into-the-air-by-teammates-news-photo/1233914520?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-runs-through-getafe-players-to-news-photo/73916044?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-reacts-after-news-photo/1186194253?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-scoring-the-news-photo/1448008976?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-paris-saint-germain-scores-their-sides-news-photo/1343626225?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/neymar-of-fc-barcelona-celebrates-with-his-teammates-luis-news-photo/499044076?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-paris-saint-germain-reacts-during-the-uefa-news-photo/1472576025?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-smiles-with-the-trophy-as-he-news-photo/1328071415?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-and-sergio-agüero-of-argentina-smile-during-a-news-photo/1326653549?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-after-scoring-his-news-photo/984479386?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/kylian-mbappe-lionel-messi-and-neymar-of-paris-saint-news-photo/1355343379?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-with-the-fifa-world-news-photo/1475698105?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/ballon-dor-nominee-cristiano-ronaldo-of-portugal-and-real-news-photo/504553844?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-scoring-their-teams-news-photo/1444813428?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-reproduction-lionel-messi-of-elementary-school-news-photo/151767422?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-poses-onstage-after-winning-his-sixth-ballon-news-photo/1191655118?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-scoring-his-fourth-news-photo/98289499?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/juventus-portuguese-forward-cristiano-ronaldo-greets-news-photo/1230017365?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/new-signings-achraf-hakimi-georginio-wijnaldum-gianluigi-news-photo/1334139404?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-his-news-photo/1211008792?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-looks-on-as-catalan-pro-news-photo/849760816?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-messi-and-brazilian-ronaldinho-news-photo/52744048?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-is-awarded-with-his-seventh-ballon-dor-award-news-photo/1356248351?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-poses-onstage-after-winning-his-sixth-ballon-news-photo/1191655197?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-reproduction-lionel-messi-and-students-of-first-news-photo/151767452?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/gabriela-riboldi-headmistress-of-elementary-school-general-news-photo/151767456?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/group-of-children-who-wear-argentina-and-newells-old-boys-news-photo/151767430?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/group-of-children-who-wear-argentina-and-newells-old-boys-news-photo/151767435?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/group-of-children-who-wear-argentina-and-newells-old-boys-news-photo/151767436?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/group-of-children-who-wear-argentina-and-newells-old-boys-news-photo/151767426?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-reproduction-baby-lionel-messi-poses-for-a-picture-news-photo/151767542?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-reproduction-lionel-messi-and-students-of-first-news-photo/151767424?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/general-view-of-the-diego-maradona-terraces-at-the-marcelo-news-photo/151767461?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/gabriela-riboldi-headmistress-of-elementary-school-general-news-photo/151767464?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/front-view-of-the-house-of-the-messi-family-on-estado-de-news-photo/151767460?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/front-view-of-the-school-general-las-heras-where-messi-news-photo/151767473?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-reproduction-of-la-capital-journal-lionel-messi-news-photo/151769240?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelonas-argentinian-forward-lionel-messi-walks-after-news-photo/604327120?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebreates-scoring-his-third-and-news-photo/604423428?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-beats-matteo-contini-of-real-news-photo/97924179?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-chips-the-ball-over-leonardo-news-photo/97923881?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-dribbles-the-ball-past-leonardo-news-photo/97930579?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-scores-his-teams-second-goal-news-photo/97923083?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-celebrates-after-scoring-his-news-photo/97924016?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-fc-barcelona-celebrates-after-scoring-the-news-photo/475287626?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/luis-suarez-lionel-messi-and-neymar-of-fc-barcelona-pose-news-photo/475370696?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-composite-image-a-comparison-has-been-made-between-news-photo/1245629039?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/in-this-composite-image-lionel-messi-of-argentina-cristiano-news-photo/984908994?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-with-the-fifa-world-news-photo/1451869829?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-with-angel-di-maria-news-photo/1450074633?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-with-his-children-news-photo/1450105020?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-as-he-talks-on-his-news-photo/1328074282?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-as-he-talks-on-his-news-photo/1328074284?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-reacts-as-his-team-wins-the-final-news-photo/1328694821?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/players-of-argentina-lift-in-the-air-their-captain-lionel-news-photo/1328694775?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-reacts-as-his-team-wins-the-final-news-photo/1328694628?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-with-his-wife-antonella-roccuzzo-news-photo/1450278609?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-celebrates-with-his-wife-antonela-news-photo/1450292332?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-argentina-with-his-wife-antonella-roccuzzo-news-photo/1450220162?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/lionel-messi-of-barcelona-with-the-adidas-golden-ball-award-news-photo/136058119?adppopup=true",
    "https://www.gettyimages.ca/detail/news-photo/barcelona-forward-lionel-messi-fights-for-the-ball-with-news-photo/136058057?adppopup=true",
    "https://www.gettyimages.ca/search/2/image?events=775916275&family=editorial"
]

const downloadImage = async (page, image_url, name) => {
    await page.goto(image_url);
        
    let full_size_anchor = await page.$('a#FullUrl');
    let full_size_link = await full_size_anchor.evaluate((el) => el.getAttribute('href'))

    let image_res = await fetch(full_size_link)
    image_res.body.pipe(fs.createWriteStream(`./images/${name}.jpg`))
    await page.goto('https://downloader.la/gettyimages-downloader.html');
}

const doCalls = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://downloader.la/gettyimages-downloader.html');
    
    for (let i = 0; i < sites.length;) {
        let token = await reloadAndGetCaptcha(page);
        let site = sites[i];
        try {
            let starting_message = `------------${i}.) Getting '${site}'-----------------`;
            console.log(starting_message)
        
            let res = await fetch(`https://downloader.la/shutt.php?url=${site}&token=${token}`, {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en-US,en;q=0.9,fr-CA;q=0.8,fr;q=0.7",
                    "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://downloader.la/gettyimages-downloader.html",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });
        
            let { result } = await res.json()

            if (result === 'Invalid Google captcha token! Please reload the page and try again.') {
                console.error('CAPTCHA PROBLEM');
                continue; // retry this url again
            }

            await downloadImage(page, result, i);
            console.log(`${'-'.repeat((starting_message.length - 7)/2)}success${'-'.repeat((starting_message.length - 7)/2)}\n`)
        } catch (error) {
            console.error(`Encountered an unresolvable error while getting '${site}' 8===> '${error.message}'`)
        }

        ++i;
    }

    
}

doCalls();