import { api } from "encore.dev/api";
import { db } from "./encore.service";

export interface Aerodrome {
  id: string;
  name: string;
  icao: string;
  coordinates: string;
  is_favorite: boolean;
  created_at: Date;
}

export interface CreateAerodromeRequest {
  name: string;
  icao: string;
  coordinates: string;
  is_favorite?: boolean;
}

export interface UpdateAerodromeRequest {
  id: string;
  name?: string;
  icao?: string;
  coordinates?: string;
  is_favorite?: boolean;
}

export interface AerodromesResponse {
  aerodromes: Aerodrome[];
}

const initialAerodromes = [
  {name: "ÁGUA BOA", icao: "SWHP", coordinates: "14°1'10\"S 52°9'8\"W"},
  {name: "ALTA FLORESTA", icao: "SBAT", coordinates: "9°51'59\"S 56°6'14\"W"},
  {name: "ARIQUEMES", icao: "SJOG", coordinates: "9°53'5\"S 63°2'56\"W"},
  {name: "BARRA DO GARÇAS", icao: "SBBW", coordinates: "15°51'39\"S 52°23'22\"W"},
  {name: "BARREIRAS", icao: "SNBR", coordinates: "12°4'45\"S 45°0'34\"W"},
  {name: "BAURU", icao: "SBBU", coordinates: "22°20'37\"S 49°3'14\"W"},
  {name: "BRASÍLIA", icao: "SBBR", coordinates: "15°52'16\"S 47°55'7\"W"},
  {name: "CÁCERES", icao: "SWKC", coordinates: "16°2'34\"S 57°37'47\"W"},
  {name: "CAMPO NOVO", icao: "SJKA", coordinates: "13°38'7\"S 57°53'58\"W"},
  {name: "CAMPO VERDE", icao: "SDLZ", coordinates: "15°31'55\"S 55°8'16\"W"},
  {name: "CANARANA", icao: "SWEK", coordinates: "13°34'28\"S 52°16'14\"W"},
  {name: "CATALÃO", icao: "SWKT", coordinates: "18°13'1\"S 47°56'5\"W"},
  {name: "CONFRESA", icao: "SJHG", coordinates: "10°38'1\"S 51°34'2\"W"},
  {name: "CORUMBÁ", icao: "SBCR", coordinates: "19°0'43\"S 57°40'17\"W"},
  {name: "CUIABÁ", icao: "SBCY", coordinates: "15°39'0\"S 56°7'1\"W"},
  {name: "DIAMANTINO", icao: "SWDM", coordinates: "14°22'37\"S 56°24'2\"W"},
  {name: "FAZ BOA ESPERANÇA", icao: "SJPW", coordinates: "12°53'37\"S 56°21'50\"W"},
  {name: "FAZ FLAMINGO CNP", icao: "SJFY", coordinates: "13°51'5\"S 57°56'41\"W"},
  {name: "FAZ TAMANDUA", icao: "SDTH", coordinates: "13°8'24\"S 57°34'36\"W"},
  {name: "FAZ TRÊS IRMÃOS", icao: "SSIY", coordinates: "9°20'44\"S 55°33'5\"W"},
  {name: "FAZ ALIANÇA", icao: "SWYH", coordinates: "17°17'33\"S 58°18'52\"W"},
  {name: "FAZ GAIVOTA PARANÁ", icao: "SDGP", coordinates: "14°0'45\"S 53°28'0\"W"},
  {name: "FAZ RIO AZUL", icao: "SJUB", coordinates: "15°11'0\"S 60°13'9\"W"},
  {name: "GOIÂNIA", icao: "SBGO", coordinates: "16°37'57\"S 49°13'16\"W"},
  {name: "FAZ SANTA LAURA", icao: "SWIB", coordinates: "10°51'46\"S 54°54'0\"W"},
  {name: "ITAITUBA", icao: "SBIH", coordinates: "4°14'32\"S 56°0'3\"W"},
  {name: "JATAÍ", icao: "SWJW", coordinates: "17°49'48\"S 51°46'31\"W"},
  {name: "JUÍNA", icao: "SWJN", coordinates: "11°25'10\"S 58°42'46\"W"},
  {name: "JUNDIAÍ", icao: "SBJD", coordinates: "23°10'54\"S 46°56'37\"W"},
  {name: "LONDRINA", icao: "SBLO", coordinates: "23°19'49\"S 51°8'12\"W"},
  {name: "LUCAS DO RIO VERDE", icao: "SILC", coordinates: "13°2'16\"S 55°57'1\"W"},
  {name: "LUÍS EDUARDO MAGALHÃES", icao: "SWNE", coordinates: "12°4'6\"S 45°42'41\"W"},
  {name: "MATUPÁ", icao: "SWXM", coordinates: "10°10'13\"S 54°57'10\"W"},
  {name: "MINAÇU", icao: "SWMQ", coordinates: "13°33'2\"S 48°12'2\"W"},
  {name: "MIRASSOL D'OESTE", icao: "SIUY", coordinates: "15°41'14\"S 58°6'41\"W"},
  {name: "MORRO DO CHAPÉU", icao: "SIOJ", coordinates: "14°57'30\"S 55°48'3\"W"},
  {name: "NOVA XAVANTINA", icao: "SWXV", coordinates: "14°41'27\"S 52°20'57\"W"},
  {name: "PARANATINGA", icao: "SWSP", coordinates: "13°43'31\"S 54°44'18\"W"},
  {name: "PRES. PRUDENTE", icao: "SBDN", coordinates: "22°10'42\"S 51°25'8\"W"},
  {name: "PRES. VENCESLAU", icao: "SDPV", coordinates: "21°33'36\"S 51°53'4\"W"},
  {name: "PRIMAVERA DO LESTE", icao: "SWPY", coordinates: "15°33'56\"S 54°20'16\"W"},
  {name: "QUERÊNCIA", icao: "SDLN", coordinates: "12°36'49\"S 52°9'6\"W"},
  {name: "RONDONÓPOLIS", icao: "SBRD", coordinates: "16°35'17\"S 54°43'18\"W"},
  {name: "SÃO JOSÉ DO RIO PRETO", icao: "SBSR", coordinates: "20°48'58\"S 49°24'17\"W"},
  {name: "S. JOSÉ DO RIO CLARO", icao: "SJRT", coordinates: "13°26'3\"S 56°43'53\"W"},
  {name: "SÃO JESUS DE GOIAS", icao: "SWAD", coordinates: "18°15'39\"S 49°35'49\"W"},
  {name: "SÃO MIGUEL ARAGUAIA", icao: "SWUA", coordinates: "13°20'2\"S 50°12'21\"W"},
  {name: "SINOP", icao: "SWSI", coordinates: "11°53'6\"S 55°35'10\"W"},
  {name: "SORRISO", icao: "SBSO", coordinates: "12°28'22\"S 55°40'8\"W"},
  {name: "SORRISO FAZ. N. JERUS", icao: "SSJZ", coordinates: "12°52'57\"S 55°41'49\"W"},
  {name: "STO ANTONIO LEVERGER", icao: "SWLV", coordinates: "15°51'9\"S 56°5'17\"W"},
  {name: "TANGARÁ DA SERRA", icao: "SWTS", coordinates: "14°39'43\"S 57°26'38\"W"},
  {name: "TUPI PAULISTA", icao: "SDTI", coordinates: "21°23'38\"S 51°36'3\"W"},
  {name: "UBERLÂNDIA", icao: "SBUL", coordinates: "18°53'1\"S 48°13'31\"W"},
  {name: "BIG MASTER TANGARÁ", icao: "SJLS", coordinates: "14°38'12\"S 57°36'29\"W"},
  {name: "BRASNORTE", icao: "SDNB", coordinates: "12°5'58\"S 58°0'6\"W"},
  {name: "PORTO JOFRE", icao: "SWPJ", coordinates: "17°21'5\"S 56°46'2\"W"},
  {name: "GUAPIRAMA", icao: "SJBT", coordinates: "13°55'29\"S 57°14'36\"W"},
  {name: "SÃO PAULO", icao: "SBSP", coordinates: "23°37'36\"S 46°39'24\"W"},
  {name: "RIO DE JANEIRO", icao: "SBRJ", coordinates: "22°48'37\"S 43°15'2\"W"}
];

async function seedAerodromes() {
  for (const ad of initialAerodromes) {
    const id = `aerodrome_${ad.icao}`;
    const now = new Date();
    await db.exec`
      INSERT INTO aerodromes (id, name, icao, coordinates, is_favorite, created_at)
      VALUES (${id}, ${ad.name}, ${ad.icao}, ${ad.coordinates}, true, ${now})
      ON CONFLICT (icao) DO NOTHING
    `;
  }
}

// Retrieves all aerodromes.
export const getAerodromes = api<void, AerodromesResponse>(
  { expose: true, method: "GET", path: "/aerodromes" },
  async () => {
    const countResult = await db.queryRow<{ count: string }>`SELECT COUNT(*) as count FROM aerodromes`;
    if (countResult && parseInt(countResult.count) === 0) {
      await seedAerodromes();
    }
    
    const aerodromes = await db.queryAll<Aerodrome>`
      SELECT * FROM aerodromes ORDER BY is_favorite DESC, name ASC
    `;
    return { aerodromes };
  }
);

// Creates a new aerodrome.
export const createAerodrome = api<CreateAerodromeRequest, Aerodrome>(
  { expose: true, method: "POST", path: "/aerodromes" },
  async (req) => {
    const id = `aerodrome_${req.icao}`;
    const now = new Date();

    const aerodrome = await db.queryRow<Aerodrome>`
      INSERT INTO aerodromes (id, name, icao, coordinates, is_favorite, created_at)
      VALUES (${id}, ${req.name}, ${req.icao}, ${req.coordinates}, ${req.is_favorite || false}, ${now})
      RETURNING *
    `;
    return aerodrome!;
  }
);

// Updates an existing aerodrome.
export const updateAerodrome = api<UpdateAerodromeRequest, Aerodrome>(
  { expose: true, method: "PUT", path: "/aerodromes/:id" },
  async (req) => {
    const aerodrome = await db.queryRow<Aerodrome>`
      UPDATE aerodromes
      SET name = COALESCE(${req.name}, name),
          icao = COALESCE(${req.icao}, icao),
          coordinates = COALESCE(${req.coordinates}, coordinates),
          is_favorite = COALESCE(${req.is_favorite}, is_favorite)
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!aerodrome) throw new Error("Aerodrome not found");
    return aerodrome;
  }
);

// Deletes an aerodrome.
export const deleteAerodrome = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/aerodromes/:id" },
  async (req) => {
    await db.exec`DELETE FROM aerodromes WHERE id = ${req.id}`;
  }
);
