import s from './index.module.scss';

import { Navigation } from '../../components/Navigation/Navigation'
import { Paragraph } from '../../components/Paragraph/Paragraph';

  //TODO: get some real text to put on the about page
  const lorumIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eleifend est et libero volutpat, id volutpat leo laoreet. Vestibulum cursus mattis ligula. Ut nec justo at leo viverra sollicitudin. In dignissim condimentum viverra. Quisque sit amet massa porta, auctor neque eu, aliquam augue. Nunc vel facilisis ligula. Nulla feugiat lacus sed fringilla semper. Maecenas ut elit sollicitudin, vestibulum lorem ornare, porta augue. Integer pulvinar blandit gravida. Donec pharetra rhoncus velit quis placerat. Sed vitae fermentum nisi, eget dictum leo. Suspendisse aliquet nunc quis mi egestas semper. Ut vulputate quam id hendrerit ornare.\nSuspendisse fringilla nisl orci, eu pulvinar tortor volutpat at. Donec vestibulum nisi et massa bibendum tempor eu ut odio. Etiam eu erat eu turpis dapibus finibus a a tellus. Integer nec nisl sed elit tempus tempor. Vivamus eget tortor vel libero tempor mattis. Aenean consectetur turpis erat, id hendrerit enim dignissim pulvinar. Vivamus interdum rhoncus ante, sit amet imperdiet risus. Nulla lorem lacus, blandit sed ante id, fringilla varius leo.\nDonec ac condimentum nunc, a pharetra quam. Aliquam cursus ultrices interdum. Quisque efficitur euismod consectetur. Nullam velit turpis, faucibus sit amet ex a, consequat auctor ante. Etiam non tellus imperdiet, ullamcorper leo ac, feugiat mi. In eget vulputate metus, rhoncus aliquam neque. Etiam porta bibendum purus et rutrum. Nulla ac sapien metus. Sed lacinia tortor mattis rhoncus eleifend. Ut sagittis sapien libero, et varius enim semper sed. Nam semper bibendum convallis. Nullam bibendum sodales neque, nec imperdiet nisi cursus molestie.\nUt massa tortor, malesuada in nisl id, vestibulum sodales massa. Mauris scelerisque quam ut quam commodo elementum. Cras rhoncus volutpat dolor, a sodales nunc accumsan nec. In diam justo, facilisis sed maximus eleifend, porttitor quis orci. Etiam condimentum vel tortor sit amet feugiat. Sed lacinia vitae urna ac auctor. Sed varius odio id dolor fringilla, placerat euismod nisl fringilla. Donec suscipit metus quis dui iaculis, sed tempor neque condimentum. Aliquam accumsan, nisl eget dignissim aliquet, nisi eros pulvinar sem, ac dapibus odio metus ac ex. Vestibulum a tellus viverra, porttitor nisi sed, facilisis velit. Morbi et nisi nec sem imperdiet malesuada ut at mi. Proin nulla tortor, lobortis ut tortor ac, mollis ultricies felis. Donec ac nunc pulvinar, malesuada urna vitae, laoreet enim. Integer a nibh id lectus aliquet placerat ac a velit. Suspendisse placerat faucibus turpis, ut imperdiet libero dignissim at. Pellentesque finibus quis ligula sit amet rhoncus.\nVestibulum magna massa, pulvinar quis libero eu, finibus mattis est. Etiam elementum bibendum erat ut laoreet. Vestibulum porta mauris dapibus nisi commodo, a sodales metus ultrices. Proin tempor ipsum et risus tempus blandit. Etiam non consequat dolor. Duis euismod, erat quis commodo porta, mi eros auctor odio, sit amet aliquet nulla ligula sed enim. Ut rutrum nulla vitae sem lacinia sodales. In a erat sed purus cursus tempor. Pellentesque mattis tempus volutpat. Pellentesque vitae porta nisl. Integer sit amet neque nisi. Integer ultrices cursus risus vitae pulvinar. Proin vel leo pulvinar, elementum mauris a, facilisis felis. Pellentesque efficitur mollis nisl, id sodales turpis efficitur ut.`
  const lorumParagraphs = lorumIpsum.split("\n");

export function Index() {
  return (
    <div className={s.page}>
      <div className={s.page__header}>
        <Navigation/>
      </div>
      <figure className={s.page__figure}>
        <img src='/vinnumynd.jpg' className={s.page__pic}/>
        <figcaption className={s.page__figcaption}>
          Photo by <a>someone</a>, of the excavations in progress.
        </figcaption>
      </figure>

      <div className={s.page__textNimage}>
        <Paragraph text={lorumParagraphs[0]+"\n"+lorumParagraphs[1]}
          title={lorumIpsum.substring(4,16)}
          image={'/placeholder.jpg'}
          horizontal={true}
          invert={false}/>
        <Paragraph text={lorumParagraphs[3]+"\n"+lorumParagraphs[4]}
          title={lorumIpsum.substring(32,40)}
          image={'/placeholder_long.png'}
          horizontal={false}
          invert={false}/>
      </div>
    </div>
  )
}