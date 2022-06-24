/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { GLib } = imports.gi

var guessIdentifierScheme = str => {
    if (GLib.uuid_string_is_valid(str)) return getIdentifierScheme('uuid')

    const digits = str.replace(/-/g, '').split('')
        .map(x => x.toLowerCase() === 'x' ? 10 : parseInt(x))

    if (digits.length === 13 && digits
        .map((x, i) => i % 2 ? 3 * x : x)
        .reduce((a, b) => a + b) % 10 === 0) return getIdentifierScheme('isbn_13')

    if (digits.length === 10 && digits
        .map((x, i) => (digits.length - i) * x)
        .reduce((a, b) => a + b) % 11 === 0) return getIdentifierScheme('isbn_10')

    if (/^B[\dA-Z]{9}$/.test(str))
        return getIdentifierScheme('asin')
}

var identifierSchemes = {
    doi: {
        label: _('DOI'),
        name: _('Digital Object Identifier'),
        onix: '06'
    },
    isbn: {
        label: _('ISBN'),
        name: _('International Standard Book Number')
    },
    isbn_10: {
        label: _('ISBN-10'),
        name: _('International Standard Book Number'),
        onix: '02'
    },
    isbn_13: {
        label: _('ISBN-13'),
        name: _('International Standard Book Number'),
        onix: '15'
    },
    isbn_a: {
        label: _('ISBN-A'),
        name: _('International Standard Book Number'),
        onix: '26'
    },
    jdcn: {
        label: _('JDCN'),
        name: _('Japan Digital Comic Number')
    },
    uuid: {
        label: _('UUID'),
        name: _('Universally-Unique Identifier')
    },
    url: {
        label: _('URL'),
        name: _('Uniform Resource Locator')
    },
    uri: {
        label: _('URI'),
        name: _('Uniform Resource Identifier')
    },
    issn: {
        label: _('ISSN'),
        name: _('International Standard Serial Number')
    },
    asin: {
        label: _('Amazon'),
        name: _('Amazon Standard Identification Number'),
        alias: ['amazon', 'mobi-asin']
    },
    oclc: {
        label: _('OCLC'),
        name: _('Online Computer Library Center'),
        alias: ['ocn']
    },
    arxiv: {
        label: _('arXiv'),
        name: _('arXiv')
    },
    calibre: {
        label: _('calibre'),
        name: _('calibre'),
    },
    foliate: {
        label: _('Foliate'),
        name: _('Foliate generated identifier'),
    },
}
const identifierSchemesMap = new Map()
Object.keys(identifierSchemes).forEach(key => {
    const x = identifierSchemes[key]
    identifierSchemes[key].key = key
    identifierSchemesMap.set(key, x)
    if (x.onix) identifierSchemesMap.set(x.onix, x)
    if (x.alias) x.alias.forEach(a => identifierSchemesMap.set(a, x))
})
var getIdentifierScheme = x => typeof x === 'string'
    ? identifierSchemesMap.get(x)
    || identifierSchemesMap.get(x.toLowerCase())
    : null

// see https://idpf.github.io/epub-registries/authorities/
// NOTE: the keys are only for the reserved authority values (which is case
// insensitive); for other authorities the URI should be used
var subjectAuthorities = {
    aat: {
        label: _('AAT'),
        name: _('The Getty Art and Architecture Taxonomy')
    },
    bic: {
        label: _('BIC'),
        name: _('Book Industry Communication')
    },
    bisac: {
        label: _('BISAC'),
        name: _('Book Industry Standards and Communications'),
        uri: 'http://www.bisg.org/standards/bisac_subject/index.html'
    },
    clc: {
        label: _('CLC'),
        name: _('Chinese Library Classification')
    },
    ddc: {
        label: _('DDC'),
        name: _('Dewey Decimal Classification'),
        uri: 'http://purl.org/dc/terms/DDC'
    },
    clil: {
        label: _('CLIL'),
        name: _('Commission de Liaison Interprofessionnelle du Livre')
    },
    eurovoc: {
        label: _('EuroVoc'),
        name: _('EuroVoc')
    },
    medtop: {
        label: _('MEDTOP'),
        name: _('IPTC Media Topics')
    },
    lcc: {
        label: _('LCC'),
        name: _('Library of Congress Classification'),
        uri: 'http://purl.org/dc/terms/LCC'
    },
    lcsh: {
        label: _('LCSH'),
        name: _('Library of Congress Subject Headings'),
        uri: 'http://purl.org/dc/terms/LCSH'
    },
    ndc: {
        label: _('NDC'),
        name: _('Nippon Decimal Classification')
    },
    thema: {
        label: _('Thema'),
        name: _('Thema')
    },
    udc: {
        label: _('UDC'),
        name: _('Universal Decimal Classification'),
        uri: 'http://purl.org/dc/terms/UDC'
    },
    wgs: {
        label: _('WGS'),
        name: _('Warengruppen-Systematik')
    },
    dcmitype: {
        label: _('DCMIType'),
        name: _('DCMI Type Vocabulary'),
        uri: 'http://purl.org/dc/terms/DCMIType'
    },
    audience: {
        label: _('Audience'),
        name: _('Intended Audience'),
        uri: 'http://schema.org/audience'
    }
}
const subjectAuthorityByURIMap = new Map()
Object.keys(subjectAuthorities).forEach(key => {
    const x = subjectAuthorities[key]
    subjectAuthorities[key].key = key
    subjectAuthorityByURIMap.set(key, x)
    if (x.uri) subjectAuthorityByURIMap.set(x.uri, x)
})
var getSubjectAuthority = x => typeof x === 'string'
    ? subjectAuthorityByURIMap.get(x)
    || subjectAuthorityByURIMap.get(x.toLowerCase())
    : null


/*
    MARC Code List for Relators
    generated from https://www.loc.gov/marc/relators/relacode.html

    Go to the page, use developer tools to select the table as `temp0`, then run:
    ```js
    [...temp0.querySelectorAll('tr')].map(tr => {
        const code = tr.querySelector('td.code')
        const label = tr.querySelector('td:not(.code)')
        if (code && label) {
            const key = code.textContent
            const val = label.textContent
            if (!key.startsWith('-')) {
                return `${key}: _('${val}')`
            }
        }
    }).filter(x => x).join(',\n')
    ```
*/
var getMarcRelator = code => typeof code === 'string'
    ? marcRelators[code] || marcRelators[code.toLowerCase()]
    : marcRelators.ctb
var marcRelators = {
    // Translators: see https://www.loc.gov/marc/relators/relaterm.html
    // for detailed descriptions
    abr: _('Abridger'),
    acp: _('Art copyist'),
    act: _('Actor'),
    adi: _('Art director'),
    adp: _('Adapter'),
    aft: _('Author of afterword, colophon, etc.'),
    anl: _('Analyst'),
    anm: _('Animator'),
    ann: _('Annotator'),
    ant: _('Bibliographic antecedent'),
    ape: _('Appellee'),
    apl: _('Appellant'),
    app: _('Applicant'),
    aqt: _('Author in quotations or text abstracts'),
    arc: _('Architect'),
    ard: _('Artistic director'),
    arr: _('Arranger'),
    art: _('Artist'),
    asg: _('Assignee'),
    asn: _('Associated name'),
    ato: _('Autographer'),
    att: _('Attributed name'),
    auc: _('Auctioneer'),
    aud: _('Author of dialog'),
    aui: _('Author of introduction, etc.'),
    aus: _('Screenwriter'),
    aut: _('Author'),
    bdd: _('Binding designer'),
    bjd: _('Bookjacket designer'),
    bkd: _('Book designer'),
    bkp: _('Book producer'),
    blw: _('Blurb writer'),
    bnd: _('Binder'),
    bpd: _('Bookplate designer'),
    brd: _('Broadcaster'),
    brl: _('Braille embosser'),
    bsl: _('Bookseller'),
    cas: _('Caster'),
    ccp: _('Conceptor'),
    chr: _('Choreographer'),
    cli: _('Client'),
    cll: _('Calligrapher'),
    clr: _('Colorist'),
    clt: _('Collotyper'),
    cmm: _('Commentator'),
    cmp: _('Composer'),
    cmt: _('Compositor'),
    cnd: _('Conductor'),
    cng: _('Cinematographer'),
    cns: _('Censor'),
    coe: _('Contestant-appellee'),
    col: _('Collector'),
    com: _('Compiler'),
    con: _('Conservator'),
    cor: _('Collection registrar'),
    cos: _('Contestant'),
    cot: _('Contestant-appellant'),
    cou: _('Court governed'),
    cov: _('Cover designer'),
    cpc: _('Copyright claimant'),
    cpe: _('Complainant-appellee'),
    cph: _('Copyright holder'),
    cpl: _('Complainant'),
    cpt: _('Complainant-appellant'),
    cre: _('Creator'),
    crp: _('Correspondent'),
    crr: _('Corrector'),
    crt: _('Court reporter'),
    csl: _('Consultant'),
    csp: _('Consultant to a project'),
    cst: _('Costume designer'),
    ctb: _('Contributor'),
    cte: _('Contestee-appellee'),
    ctg: _('Cartographer'),
    ctr: _('Contractor'),
    cts: _('Contestee'),
    ctt: _('Contestee-appellant'),
    cur: _('Curator'),
    cwt: _('Commentator for written text'),
    dbp: _('Distribution place'),
    dfd: _('Defendant'),
    dfe: _('Defendant-appellee'),
    dft: _('Defendant-appellant'),
    dgg: _('Degree granting institution'),
    dgs: _('Degree supervisor'),
    dis: _('Dissertant'),
    dln: _('Delineator'),
    dnc: _('Dancer'),
    dnr: _('Donor'),
    dpc: _('Depicted'),
    dpt: _('Depositor'),
    drm: _('Draftsman'),
    drt: _('Director'),
    dsr: _('Designer'),
    dst: _('Distributor'),
    dtc: _('Data contributor'),
    dte: _('Dedicatee'),
    dtm: _('Data manager'),
    dto: _('Dedicator'),
    dub: _('Dubious author'),
    edc: _('Editor of compilation'),
    edm: _('Editor of moving image work'),
    edt: _('Editor'),
    egr: _('Engraver'),
    elg: _('Electrician'),
    elt: _('Electrotyper'),
    eng: _('Engineer'),
    enj: _('Enacting jurisdiction'),
    etr: _('Etcher'),
    evp: _('Event place'),
    exp: _('Expert'),
    fac: _('Facsimilist'),
    fds: _('Film distributor'),
    fld: _('Field director'),
    flm: _('Film editor'),
    fmd: _('Film director'),
    fmk: _('Filmmaker'),
    fmo: _('Former owner'),
    fmp: _('Film producer'),
    fnd: _('Funder'),
    fpy: _('First party'),
    frg: _('Forger'),
    gis: _('Geographic information specialist'),
    his: _('Host institution'),
    hnr: _('Honoree'),
    hst: _('Host'),
    ill: _('Illustrator'),
    ilu: _('Illuminator'),
    ins: _('Inscriber'),
    inv: _('Inventor'),
    isb: _('Issuing body'),
    itr: _('Instrumentalist'),
    ive: _('Interviewee'),
    ivr: _('Interviewer'),
    jud: _('Judge'),
    jug: _('Jurisdiction governed'),
    lbr: _('Laboratory'),
    lbt: _('Librettist'),
    ldr: _('Laboratory director'),
    led: _('Lead'),
    lee: _('Libelee-appellee'),
    lel: _('Libelee'),
    len: _('Lender'),
    let: _('Libelee-appellant'),
    lgd: _('Lighting designer'),
    lie: _('Libelant-appellee'),
    lil: _('Libelant'),
    lit: _('Libelant-appellant'),
    lsa: _('Landscape architect'),
    lse: _('Licensee'),
    lso: _('Licensor'),
    ltg: _('Lithographer'),
    lyr: _('Lyricist'),
    mcp: _('Music copyist'),
    mdc: _('Metadata contact'),
    med: _('Medium'),
    mfp: _('Manufacture place'),
    mfr: _('Manufacturer'),
    mod: _('Moderator'),
    mon: _('Monitor'),
    mrb: _('Marbler'),
    mrk: _('Markup editor'),
    msd: _('Musical director'),
    mte: _('Metal-engraver'),
    mtk: _('Minute taker'),
    mus: _('Musician'),
    nrt: _('Narrator'),
    opn: _('Opponent'),
    org: _('Originator'),
    orm: _('Organizer'),
    osp: _('Onscreen presenter'),
    oth: _('Other'),
    own: _('Owner'),
    pan: _('Panelist'),
    pat: _('Patron'),
    pbd: _('Publishing director'),
    pbl: _('Publisher'),
    pdr: _('Project director'),
    pfr: _('Proofreader'),
    pht: _('Photographer'),
    plt: _('Platemaker'),
    pma: _('Permitting agency'),
    pmn: _('Production manager'),
    pop: _('Printer of plates'),
    ppm: _('Papermaker'),
    ppt: _('Puppeteer'),
    pra: _('Praeses'),
    prc: _('Process contact'),
    prd: _('Production personnel'),
    pre: _('Presenter'),
    prf: _('Performer'),
    prg: _('Programmer'),
    prm: _('Printmaker'),
    prn: _('Production company'),
    pro: _('Producer'),
    prp: _('Production place'),
    prs: _('Production designer'),
    prt: _('Printer'),
    prv: _('Provider'),
    pta: _('Patent applicant'),
    pte: _('Plaintiff-appellee'),
    ptf: _('Plaintiff'),
    pth: _('Patent holder'),
    ptt: _('Plaintiff-appellant'),
    pup: _('Publication place'),
    rbr: _('Rubricator'),
    rcd: _('Recordist'),
    rce: _('Recording engineer'),
    rcp: _('Addressee'),
    rdd: _('Radio director'),
    red: _('Redaktor'),
    ren: _('Renderer'),
    res: _('Researcher'),
    rev: _('Reviewer'),
    rpc: _('Radio producer'),
    rps: _('Repository'),
    rpt: _('Reporter'),
    rpy: _('Responsible party'),
    rse: _('Respondent-appellee'),
    rsg: _('Restager'),
    rsp: _('Respondent'),
    rsr: _('Restorationist'),
    rst: _('Respondent-appellant'),
    rth: _('Research team head'),
    rtm: _('Research team member'),
    sad: _('Scientific advisor'),
    sce: _('Scenarist'),
    scl: _('Sculptor'),
    scr: _('Scribe'),
    sds: _('Sound designer'),
    sec: _('Secretary'),
    sgd: _('Stage director'),
    sgn: _('Signer'),
    sht: _('Supporting host'),
    sll: _('Seller'),
    sng: _('Singer'),
    spk: _('Speaker'),
    spn: _('Sponsor'),
    spy: _('Second party'),
    srv: _('Surveyor'),
    std: _('Set designer'),
    stg: _('Setting'),
    stl: _('Storyteller'),
    stm: _('Stage manager'),
    stn: _('Standards body'),
    str: _('Stereotyper'),
    tcd: _('Technical director'),
    tch: _('Teacher'),
    ths: _('Thesis advisor'),
    tld: _('Television director'),
    tlp: _('Television producer'),
    trc: _('Transcriber'),
    trl: _('Translator'),
    tyd: _('Type designer'),
    tyg: _('Typographer'),
    uvp: _('University place'),
    vac: _('Voice actor'),
    vdg: _('Videographer'),
    wac: _('Writer of added commentary'),
    wal: _('Writer of added lyrics'),
    wam: _('Writer of accompanying material'),
    wat: _('Writer of added text'),
    wdc: _('Woodcutter'),
    wde: _('Wood engraver'),
    win: _('Writer of introduction'),
    wit: _('Witness'),
    wpr: _('Writer of preface'),
    wst: _('Writer of supplementary textual content')
}
