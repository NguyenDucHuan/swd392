import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Logo } from '../../assets/images/logo.jpg';

export default function IntroRarity() {
  return (
    <section className="relative mt-10 md:mt-24">
      <div className="overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl bg-slate-50 px-0 md:bg-transparent md:px-6 lg:px-8">
          <div className="mx-auto flex flex-col rounded-3xl bg-slate-50 py-24 lg:mx-0 ">
            <div className="relative flex h-52 w-full justify-center sm:h-64 md:h-80 lg:h-96">
              <LazyLoadImage
                src={Logo}
                width="100%"
                effect="blur"
                alt="BlindBox Shop"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="px-6 pt-16 md:px-0">
              <div className="text-center">
                <h1 className="m-auto text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:max-w-3xl">
                  <span className="block text-violet-500 lg:inline">
                    Exclusive
                  </span>{' '}
                  BlindBox Collection
                </h1>
                <p className="mx-auto max-w-2xl pt-12 text-lg leading-8 text-gray-900">
                  BlindBoxes are exciting mystery collectibles that offer a thrilling unboxing experience. Each box contains one of many possible rare designs, but you won't know which one until you open it! With over 100 different designs and varying rarity levels, each BlindBox gives you the chance to discover something truly special. Collectors around the world love the excitement and surprise of adding these unique items to their collection. Will you find a common character or a super-rare limited edition? The mystery is part of the fun!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}