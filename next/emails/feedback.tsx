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

interface LuuppiFeedbackProps {
  senderName: string;
  senderEmail: string;
  receiver: string;
  subject: string;
  message: string;
}

export const LuuppiFeedback = ({
  message,
  receiver,
  senderEmail,
  senderName,
  subject,
}: LuuppiFeedbackProps) => (
  <Html>
    <Head />
    <Preview>Palautetta vastaanotettu</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          alt="Luuppi"
          height="80"
          src={'https://luuppi.fi/logo.png'}
          style={logo}
          width="160"
        />
        <Text style={heading}>Palautetta vastaanotettu</Text>
        <Text style={paragraph}>
          Tämä palaute on lähetetty Luupin verkkosivujen palautelomakkeen
          kautta. Tähän sähköpostiin ei voi vastata. Mikäli haluat vastata
          palautteeseen, ota yhteyttä suoraan palautteen lähettäjään, mikäli hän
          on antanut yhteystietonsa.
        </Text>
        <Container>
          <Text style={titleText}>
            <span style={titleSpan}>Lähettäjän nimi:</span> {senderName}
          </Text>
          <Text style={titleText}>
            <span style={titleSpan}>Lähettäjän sähköposti:</span> {senderEmail}
          </Text>
          <Text style={titleText}>
            <span style={titleSpan}>Vastaanottaja sähköposti:</span> {receiver}
          </Text>
        </Container>
        <Container style={messageContainer}>
          <Text style={messageTitle}>{subject}</Text>
          <Text style={paragraph}>{message}</Text>
        </Container>
        <Hr style={hr} />
        <Text style={footer}>Luuppi ry, Yliopistonkatu 58b, 33100 Tampere</Text>
        <Text style={footer}>Y-tunnus: 0512347-2</Text>
      </Container>
    </Body>
  </Html>
);

LuuppiFeedback.PreviewProps = {
  senderName: 'Luuppilainen',
  senderEmail: 'test@luuppi.fi',
  message:
    'Toimintanne on ollut kiitettävän aktiivista ja monipuolista, mikä on rikastuttanut opiskelijoidemme arkea huomattavasti. Erityisesti tapahtumienne lämminhenkisyys ja yhteisöllisyys ovat olleet hienoja kokemuksia monille. Kiitos myös tiedotuksen selkeydestä ja ajantasaisuudesta.',
  receiver: 'hallitus@luuppi.fi',
  subject: 'Särmää toimintaa!',
} as LuuppiFeedbackProps;

export default LuuppiFeedback;

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

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
};
