import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: '🏗️ Homelab & Infra',
    description: (
      <>Découvre mes déploiements : Cluster K3s, Proxmox et WAF.</>
    ),
    link: '/docs/category/-homelab',
    customBg: styles.BgHomelab,
  },
  {
    title: '📚 Notions & Cours',
    description: (
      <>Base de connaissances : Modèle OSI, protocoles et DevOps.</>
    ),
    link: '/docs/notions',
    customBg: styles.BgNotionsCours,
  },
  {
    title: '🛠️ Boîte à Outils',
    description: (
      <>Cheat Sheets pour Git, Kubernetes, Linux et plus.</>
    ),
    link: '/docs/outils',
    customBg: styles.BgBoiteOutils,
  },
];

function Feature({title, description, link, customBg}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx("text--center padding-horiz--md", customBg)}>
        <Heading as="h3" className={styles.featureHeading}>
          {title}
        </Heading>
        <p className="padding-vert--sm">{description}</p>
        <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to={link}>
                Accéder →
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}