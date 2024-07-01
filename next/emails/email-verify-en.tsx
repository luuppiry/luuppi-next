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
    <Preview>Change Your Email Address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          alt="Luuppi"
          height="80"
          src={'https://luuppi.fi/logo.png'}
          style={logo}
          width="160"
        />
        <Text style={paragraph}>Hello {name},</Text>
        <Text style={paragraph}>
          You have requested to change your email address. Please confirm your
          new email address by clicking the button below. If you did not make
          this request, you can ignore this email.
        </Text>
        <Section style={btnContainer}>
          <Button href={link} style={button}>
            Confirm Email
          </Button>
        </Section>
        <Text style={paragraph}>
          Best regards,
          <br />
          Luuppi ry - WWW/IT Team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Luuppi ry, Yliopistonkatu 58b, 33100 Tampere</Text>
        <Text style={footer}>Business ID: 0512347-2</Text>
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
