import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface LuuppiEmailVerifyProps {
  name: string;
  link: string;
}

export const LuuppiEmailVerify = ({ name, link }: LuuppiEmailVerifyProps) => (
  <Html>
    <Head />
    <Preview>Sähköpostiosoitteesi vaihto</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          alt="Luuppi"
          height="80"
          src={'https://luuppi.fi/logo.png'}
          style={logo}
          width="160"
        />
        <Text style={paragraph}>Hei {name},</Text>
        <Text style={paragraph}>
          Olet pyytänyt sähköpostiosoitteesi vaihtoa. Vahvista uusi
          sähköpostiosoitteesi klikkaamalla alla olevaa nappia. Jos et tehnyt
          tätä pyyntöä, voit jättää tämän sähköpostin huomiotta.
        </Text>
        <Section style={btnContainer}>
          <Button href={link} style={button}>
            Vahvista sähköposti
          </Button>
        </Section>
        <Text style={paragraph}>
          Terveisin,
          <br />
          Luuppi ry - WWW/IT-tiimi
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Luuppi ry, Yliopistonkatu 58b, 33100 Tampere</Text>
        <Text style={footer}>Y-tunnus: 0512347-2</Text>
      </Container>
    </Body>
  </Html>
);

LuuppiEmailVerify.PreviewProps = {
  name: 'Luuppilainen',
  link: 'https://luuppi.fi/404',
} as LuuppiEmailVerifyProps;

export default LuuppiEmailVerify;

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

const btnContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#787eba',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
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
