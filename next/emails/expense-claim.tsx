import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Text,
} from '@react-email/components';

interface ExpenseClaimLine {
  date: string;
  description: string;
  amount: string;
}

interface LuuppiExpenseClaimProps {
  reference: string;
  senderName: string;
  senderEmail: string;
  iban: string;
  purpose: string;
  notes?: string;
  lines: ExpenseClaimLine[];
  total: string;
  csvIncluded: boolean;
}

export const LuuppiExpenseClaim = ({
  reference,
  senderName,
  senderEmail,
  iban,
  purpose,
  notes,
  lines,
  total,
  csvIncluded,
}: LuuppiExpenseClaimProps) => (
  <Html>
    <Head />
    <Preview>Kulukorvaus vastaanotettu</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          alt="Luuppi"
          height="80"
          src={'https://luuppi.fi/logo.png'}
          style={logo}
          width="160"
        />
        <Text style={heading}>Kulukorvaus vastaanotettu</Text>
        <Text style={paragraph}>
          Tämä kulukorvaus on lähetetty Luupin verkkosivujen
          kulukorvauslomakkeen kautta. Lähettäjän henkilöllisyyttä ei ole
          varmennettu, joten tarkista kulut ennen maksua. Vastaus tähän viestiin
          menee suoraan lähettäjälle.
        </Text>
        <Container>
          <Text style={titleText}>
            <span style={titleSpan}>Viite:</span> {reference}
          </Text>
          <Text style={titleText}>
            <span style={titleSpan}>Lähettäjän nimi:</span> {senderName}
          </Text>
          <Text style={titleText}>
            <span style={titleSpan}>Lähettäjän sähköposti:</span> {senderEmail}
          </Text>
          <Text style={titleText}>
            <span style={titleSpan}>IBAN:</span> {iban}
          </Text>
        </Container>
        <Container style={messageContainer}>
          <Text style={messageTitle}>{purpose}</Text>
          <table style={table}>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td style={cell}>{line.date}</td>
                  <td style={cell}>{line.description}</td>
                  <td style={{ ...cell, textAlign: 'right' }}>
                    {line.amount} €
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={totalCell}>
                  Yhteensä
                </td>
                <td style={{ ...totalCell, textAlign: 'right' }}>{total} €</td>
              </tr>
            </tbody>
          </table>
          {notes ? <Text style={paragraph}>{notes}</Text> : null}
        </Container>
        <Text style={paragraph}>
          {csvIncluded
            ? 'Liitteenä yhdistetty kuitti-PDF sekä ZIP-tiedosto Procountorin laskuaineiston tuontia varten.'
            : 'Liitteenä yhdistetty kuitti-PDF. Procountorin tuontitiedostoa ei voitu luoda.'}
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Luuppi ry, Yliopistonkatu 58b, 33100 Tampere</Text>
        <Text style={footer}>Y-tunnus: 0512347-2</Text>
      </Container>
    </Body>
  </Html>
);

LuuppiExpenseClaim.PreviewProps = {
  reference: 'EK-20261018-AB12',
  senderName: 'Luuppilainen',
  senderEmail: 'test@luuppi.fi',
  iban: 'FI2112345600000785',
  purpose: 'Fuksisitsit',
  lines: [
    {
      date: '2026-10-02',
      description: 'Servetit ja lautaset',
      amount: '12,50',
    },
  ],
  total: '12,50',
  csvIncluded: true,
} as LuuppiExpenseClaimProps;

export default LuuppiExpenseClaim;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo = {
  margin: '0 auto',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const titleText = {
  fontSize: '14px',
  margin: '0',
};

const titleSpan = {
  fontWeight: 'bold',
};

const messageContainer = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '20px 0',
  padding: '10px 20px',
  borderRadius: '8px',
  backgroundColor: '#f5f5fb',
  color: '#1f2937',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0',
};

const messageTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '20px 0',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: '14px',
};

const cell = {
  padding: '6px 4px',
  borderBottom: '1px solid #dcdce8',
  verticalAlign: 'top' as const,
};

const totalCell = {
  padding: '8px 4px',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
};
